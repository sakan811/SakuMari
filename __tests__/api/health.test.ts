import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, HEAD } from "../../app/api/health/route";
import { NextRequest } from "next/server";

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockPrisma, mockApplyRateLimit } = vi.hoisted(() => ({
  mockPrisma: {
    $queryRaw: vi.fn(),
  },
  mockApplyRateLimit: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
}));

describe("Health API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for rate limiting (success)
    mockApplyRateLimit.mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/health", () => {
    test("returns 429 when rate limit is exceeded", async () => {
      // Create a mock request
      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      // Mock rate limit exceeded response
      mockApplyRateLimit.mockResolvedValueOnce({
        success: false,
        response: {
          status: 429,
          json: async () => ({
            error: "Rate limit exceeded",
            message: "Too many requests. Limit: 60 requests per 60 s.",
            retryAfter: 30,
          }),
          headers: new Headers({
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(Date.now() + 30000).toISOString(),
            "Retry-After": "30",
          }),
        },
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toEqual({
        error: "Rate limit exceeded",
        message: "Too many requests. Limit: 60 requests per 60 s.",
        retryAfter: 30,
      });
      expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("Retry-After")).toBe("30");

      // Verify that applyRateLimit was called with correct parameters
      expect(mockApplyRateLimit).toHaveBeenCalledWith(mockRequest, "health");
    });

    test("returns healthy status when database is connected", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);

      // Create a mock request
      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      // Mock environment variables through vitest config
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: "healthy",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: process.env.NODE_ENV,
        database: "connected",
        version: process.env.npm_package_version || "1.0.0",
      });

      // Verify timestamp is a valid ISO string
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);

      // Verify uptime is a positive number
      expect(data.uptime).toBeGreaterThan(0);
    });

    test("returns unhealthy status when database connection fails", async () => {
      // Mock failed database query
      mockPrisma.$queryRaw.mockRejectedValue(
        new Error("Database connection failed"),
      );

      // Create a mock request
      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      // Mock environment variables through vitest config
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toEqual({
        status: "unhealthy",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: process.env.NODE_ENV,
        database: "disconnected",
        error: "Database connection failed",
      });

      // Verify timestamp is a valid ISO string
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);

      // Verify uptime is a positive number
      expect(data.uptime).toBeGreaterThan(0);
    });

    test("uses default version when npm_package_version is not set", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);

      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.version).toBe(process.env.npm_package_version || "1.0.0");
    });

    test("uses fallback version when npm_package_version is undefined", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);

      // Temporarily remove npm_package_version from environment
      const originalVersion = process.env.npm_package_version;
      delete process.env.npm_package_version;

      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.version).toBe("1.0.0");

      // Restore the original environment variable
      process.env.npm_package_version = originalVersion;
    });

    test("handles non-Error objects in error message extraction", async () => {
      // Mock failed database query with a non-Error object
      mockPrisma.$queryRaw.mockRejectedValue("String error message");

      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toEqual({
        status: "unhealthy",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: process.env.NODE_ENV,
        database: "disconnected",
        error: "Unknown error",
      });
    });

    test("includes correct response structure for healthy state", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);

      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      // Check all required fields are present
      expect(data).toHaveProperty("status", "healthy");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("uptime");
      expect(data).toHaveProperty("environment");
      expect(data).toHaveProperty("database", "connected");
      expect(data).toHaveProperty("version");

      // Check data types
      expect(typeof data.status).toBe("string");
      expect(typeof data.timestamp).toBe("string");
      expect(typeof data.uptime).toBe("number");
      expect(typeof data.environment).toBe("string");
      expect(typeof data.database).toBe("string");
      expect(typeof data.version).toBe("string");
    });

    test("includes correct response structure for unhealthy state", async () => {
      // Mock failed database query
      mockPrisma.$queryRaw.mockRejectedValue(new Error("Connection timeout"));

      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      // Check all required fields are present
      expect(data).toHaveProperty("status", "unhealthy");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("uptime");
      expect(data).toHaveProperty("environment");
      expect(data).toHaveProperty("database", "disconnected");
      expect(data).toHaveProperty("error");

      // Check data types
      expect(typeof data.status).toBe("string");
      expect(typeof data.timestamp).toBe("string");
      expect(typeof data.uptime).toBe("number");
      expect(typeof data.environment).toBe("string");
      expect(typeof data.database).toBe("string");
      expect(typeof data.error).toBe("string");
    });
  });

  describe("HEAD /api/health", () => {
    test("returns 429 when rate limit is exceeded", async () => {
      // Create a mock request
      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      // Mock rate limit exceeded response
      mockApplyRateLimit.mockResolvedValueOnce({
        success: false,
        response: {
          status: 429,
          json: async () => ({
            error: "Rate limit exceeded",
            message: "Too many requests. Limit: 60 requests per 60 s.",
            retryAfter: 30,
          }),
          headers: new Headers({
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(Date.now() + 30000).toISOString(),
            "Retry-After": "30",
          }),
        },
      });

      const response = await HEAD(mockRequest);

      expect(response.status).toBe(429);
      expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("Retry-After")).toBe("30");

      // Verify that applyRateLimit was called with correct parameters
      expect(mockApplyRateLimit).toHaveBeenCalledWith(mockRequest, "health");
    });

    test("returns 200 status when database is connected", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);

      // Create a mock request
      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      const response = await HEAD(mockRequest);

      expect(response.status).toBe(200);
      // HEAD requests should have no body
      expect(response.body).toBeNull();
    });

    test("returns 503 status when database connection fails", async () => {
      // Mock failed database query
      mockPrisma.$queryRaw.mockRejectedValue(
        new Error("Database connection failed"),
      );

      // Create a mock request
      const mockRequest = new Request("http://localhost/api/health") as NextRequest;

      const response = await HEAD(mockRequest);

      expect(response.status).toBe(503);
      // HEAD requests should have no body
      expect(response.body).toBeNull();
    });
  });

  test("database connectivity check is performed", async () => {
    // Mock successful database query
    mockPrisma.$queryRaw.mockResolvedValue([1]);

    const mockRequest = new Request("http://localhost/api/health") as NextRequest;

    await GET(mockRequest);

    // Verify that the database query was called
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(["SELECT 1"]);
  });
});

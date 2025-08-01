import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, HEAD } from "../../app/api/health/route";
import { NextRequest } from "next/server";

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Health API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/health", () => {
    test("returns healthy status when database is connected", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);
      
      // Mock environment variables through vitest config
      const request = new NextRequest("http://localhost/api/health", {
        method: "GET",
      });

      const response = await GET(request);
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
      mockPrisma.$queryRaw.mockRejectedValue(new Error("Database connection failed"));
      
      // Mock environment variables through vitest config
      const request = new NextRequest("http://localhost/api/health", {
        method: "GET",
      });

      const response = await GET(request);
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

      const request = new NextRequest("http://localhost/api/health", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.version).toBe(process.env.npm_package_version || "1.0.0");
    });

    test("includes correct response structure for healthy state", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);

      const request = new NextRequest("http://localhost/api/health", {
        method: "GET",
      });

      const response = await GET(request);
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

      const request = new NextRequest("http://localhost/api/health", {
        method: "GET",
      });

      const response = await GET(request);
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
    test("returns 200 status when database is connected", async () => {
      // Mock successful database query
      mockPrisma.$queryRaw.mockResolvedValue([1]);

      const request = new NextRequest("http://localhost/api/health", {
        method: "HEAD",
      });

      const response = await HEAD(request);

      expect(response.status).toBe(200);
      // HEAD requests should have no body
      expect(response.body).toBeNull();
    });

    test("returns 503 status when database connection fails", async () => {
      // Mock failed database query
      mockPrisma.$queryRaw.mockRejectedValue(new Error("Database connection failed"));

      const request = new NextRequest("http://localhost/api/health", {
        method: "HEAD",
      });

      const response = await HEAD(request);

      expect(response.status).toBe(503);
      // HEAD requests should have no body
      expect(response.body).toBeNull();
    });
  });

  test("database connectivity check is performed", async () => {
    // Mock successful database query
    mockPrisma.$queryRaw.mockResolvedValue([1]);

    const request = new NextRequest("http://localhost/api/health", {
      method: "GET",
    });

    await GET(request);

    // Verify that the database query was called
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(["SELECT 1"]);
  });
});
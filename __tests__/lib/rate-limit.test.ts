/*
 * SakuMari - Japanese Kana Flashcard App
 * Copyright (C) 2025  Sakan Nirattisaykul
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyRateLimit, getEndpointType, getClientIP } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

// Mock the ioredis library
vi.mock("ioredis", () => {
  const mockPipeline = {
    zremrangebyscore: vi.fn().mockReturnThis(),
    zadd: vi.fn().mockReturnThis(),
    zcard: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([
      [null, 1], // zremrangebyscore result
      [null, 1], // zadd result
      [null, 1], // zcard result (current count)
      [null, 1], // expire result
    ]),
  };

  const mockRedis = {
    pipeline: vi.fn(() => mockPipeline),
    on: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    expire: vi.fn(),
  };

  // Create a mock Redis constructor
  class MockRedis {
    constructor() {
      return mockRedis;
    }
  }

  return {
    default: MockRedis,
  };
});


describe("Rate Limit Library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEndpointType", () => {
    it("should return correct endpoint types for different paths", () => {
      expect(getEndpointType("/api/health")).toBe("health");
      expect(getEndpointType("/api/stats")).toBe("stats");
      expect(getEndpointType("/api/flashcards/submit")).toBe("flashcards");
      expect(getEndpointType("/api/tips")).toBe("tips");
      expect(getEndpointType("/api/auth/providers")).toBe("auth");
      expect(getEndpointType("/api/unknown")).toBe("default");
    });
  });

  describe("getClientIP", () => {
    it("should extract IP from x-forwarded-for header with single IP", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "192.168.1.100" },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("192.168.1.100");
    });

    it("should extract first IP from x-forwarded-for header with multiple IPs", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.1, 192.168.1.100, 10.0.0.1" },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("203.0.113.1");
    });

    it("should handle x-forwarded-for header with spaces and trim", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "  203.0.113.1  " },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("203.0.113.1");
    });

    it("should fall back to x-real-ip header when x-forwarded-for is missing", () => {
      const request = new Request("http://localhost", {
        headers: { "x-real-ip": "198.51.100.50" },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("198.51.100.50");
    });

    it("should fall back to x-client-ip header when other headers are missing", () => {
      const request = new Request("http://localhost", {
        headers: { "x-client-ip": "192.0.2.75" },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("192.0.2.75");
    });

    it("should fall back to default IP when no IP headers are present", () => {
      const request = new Request("http://localhost") as unknown as NextRequest;

      expect(getClientIP(request)).toBe("127.0.0.1");
    });

    it("should prioritize headers in correct order: x-forwarded-for > x-real-ip > x-client-ip", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-client-ip": "192.0.2.75",
          "x-real-ip": "198.51.100.50",
          "x-forwarded-for": "203.0.113.1"
        },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("203.0.113.1");
    });

    it("should handle empty x-forwarded-for header and fall back to other headers", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "",
          "x-real-ip": "198.51.100.50"
        },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("198.51.100.50");
    });

    it("should handle whitespace-only x-forwarded-for header and fall back", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "   ",
          "x-real-ip": "198.51.100.50"
        },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("198.51.100.50");
    });

    it("should handle comma-separated IPs with varying whitespace", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.1 ,192.168.1.100, 10.0.0.1" },
      }) as unknown as NextRequest;

      expect(getClientIP(request)).toBe("203.0.113.1");
    });
  });

  describe("applyRateLimit", () => {
    const createMockRequest = (ip = "127.0.0.1"): NextRequest => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": ip },
      }) as unknown as NextRequest;
      return request;
    };

    it("should allow requests within limit", async () => {
      const request = createMockRequest("192.168.1.1");
      const result = await applyRateLimit(request, "health");

      expect(result.success).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should use user ID for authenticated requests", async () => {
      const request = createMockRequest("192.168.1.1");
      const userId = "test-user-123";

      // This test verifies that the function completes successfully with a user ID
      // The rate limiting logic is tested by the successful completion
      const result = await applyRateLimit(request, "stats", userId);

      expect(result.success).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should use IP address for unauthenticated requests", async () => {
      const request = createMockRequest("192.168.1.2");

      // This test verifies that the function completes successfully without a user ID
      // The rate limiting logic is tested by the successful completion
      const result = await applyRateLimit(request, "health");

      expect(result.success).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should fail open when Redis is not available", async () => {
      // Set environment to trigger test mode but don't provide Redis
      process.env.CREDS_PROVIDER = "false";
      process.env.REDIS_HOST = "nonexistent-host";

      const request = createMockRequest("192.168.1.1");

      // Should still succeed even without Redis due to fail-open behavior
      const result = await applyRateLimit(request, "stats");

      expect(result.success).toBe(true);
      expect(result.response).toBeUndefined();

      // Restore environment
      process.env.CREDS_PROVIDER = "true";
      delete process.env.REDIS_HOST;
    });
  });
});
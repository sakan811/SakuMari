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
import { Ratelimit } from "@upstash/ratelimit";

// Mock the Redis client
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      expire: vi.fn(),
    })),
  },
}));

// Mock the Ratelimit module
vi.mock("@upstash/ratelimit", () => {
  const mockLimit = vi.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  });

  // Export the mockLimit for use in tests
  (global as any).__mockLimit = mockLimit;

  class MockRatelimit {
    limit = mockLimit;
  }

  const mockSlidingWindow = vi.fn(() => new MockRatelimit());

  return {
    Ratelimit: Object.assign(MockRatelimit, {
      slidingWindow: mockSlidingWindow,
    }),
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

    it("should deny requests exceeding limit", async () => {
      // Mock rate limit exceeded
      (global.__mockLimit as any).mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      const request = createMockRequest("192.168.1.1");
      const result = await applyRateLimit(request, "auth");

      expect(result.success).toBe(false);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(429);
    });

    it("should handle errors gracefully and fail open", async () => {
      // Mock error in rate limiting
      (global.__mockLimit as any).mockRejectedValueOnce(new Error("Redis connection failed"));

      const request = createMockRequest("192.168.1.1");
      const result = await applyRateLimit(request, "stats");

      expect(result.success).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should use user ID for authenticated requests", async () => {
      const request = createMockRequest("192.168.1.1");
      const userId = "test-user-123";

      await applyRateLimit(request, "stats", userId);

      expect(global.__mockLimit).toHaveBeenCalledWith("user:test-user-123");
    });

    it("should use IP address for unauthenticated requests", async () => {
      const request = createMockRequest("192.168.1.2");

      await applyRateLimit(request, "health");

      expect(global.__mockLimit).toHaveBeenCalledWith("ip:192.168.1.2");
    });
  });
});
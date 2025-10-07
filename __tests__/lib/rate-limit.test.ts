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
import { applyRateLimit, getEndpointType } from "@/lib/rate-limit";
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
  const mockRatelimit = {
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
    }),
  };
  const mockSlidingWindow = vi.fn(() => mockRatelimit);

  return {
    Ratelimit: Object.assign(vi.fn(() => mockRatelimit), {
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
      const mockLimit = vi.mocked(Ratelimit().limit);
      mockLimit.mockResolvedValueOnce({
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
      const mockLimit = vi.mocked(Ratelimit().limit);
      mockLimit.mockRejectedValueOnce(new Error("Redis connection failed"));

      const request = createMockRequest("192.168.1.1");
      const result = await applyRateLimit(request, "stats");

      expect(result.success).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should use user ID for authenticated requests", async () => {
      const request = createMockRequest("192.168.1.1");
      const userId = "test-user-123";

      const mockLimit = vi.mocked(Ratelimit().limit);
      await applyRateLimit(request, "stats", userId);

      expect(mockLimit).toHaveBeenCalledWith("user:test-user-123");
    });

    it("should use IP address for unauthenticated requests", async () => {
      const request = createMockRequest("192.168.1.2");

      const mockLimit = vi.mocked(Ratelimit().limit);
      await applyRateLimit(request, "health");

      expect(mockLimit).toHaveBeenCalledWith("ip:192.168.1.2");
    });
  });
});
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

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  GET as authGet,
  POST as authPost,
} from "@/app/api/auth/[...nextauth]/route";
import { GET as providersGet } from "@/app/api/auth/providers/route";

// Store original environment variables
const originalEnv = { ...process.env };

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockHandlers, mockRateLimit } = vi.hoisted(() => ({
  mockHandlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
  mockRateLimit: vi.fn(),
}));

// Mock the auth handlers
vi.mock("@/lib/auth", () => ({
  handlers: mockHandlers,
}));

// Mock the rate limiting utility
vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: mockRateLimit,
}));

describe("Authentication API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for rate limiting - allow requests
    mockRateLimit.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe("GET /api/auth/[...nextauth]", () => {
    test("exports GET handler from auth handlers", async () => {
      const request = new NextRequest("http://localhost/api/auth/signin");

      // Call the GET handler
      await authGet(request);

      // Verify that the GET handler from auth was called
      expect(mockHandlers.GET).toHaveBeenCalledWith(request);
    });

    test("handles different auth endpoints", async () => {
      const request = new NextRequest("http://localhost/api/auth/signout");

      // Call the GET handler
      await authGet(request);

      // Verify that the GET handler from auth was called with signout request
      expect(mockHandlers.GET).toHaveBeenCalledWith(request);
    });
  });

  describe("POST /api/auth/[...nextauth]", () => {
    test("exports POST handler from auth handlers", async () => {
      const request = new NextRequest(
        "http://localhost/api/auth/callback/google",
        {
          method: "POST",
          body: JSON.stringify({ code: "test-code" }),
        },
      );

      // Call the POST handler
      await authPost(request);

      // Verify that the POST handler from auth was called
      expect(mockHandlers.POST).toHaveBeenCalledWith(request);
    });

    test("handles callback requests", async () => {
      const request = new NextRequest(
        "http://localhost/api/auth/signin/credentials",
        {
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        },
      );

      // Call the POST handler
      await authPost(request);

      // Verify that the POST handler from auth was called
      expect(mockHandlers.POST).toHaveBeenCalledWith(request);
    });
  });

  describe("GET /api/auth/providers", () => {
    test("returns credentialsEnabled: true when CREDS_PROVIDER is 'true'", async () => {
      process.env.CREDS_PROVIDER = "true";

      const response = await providersGet();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ credentialsEnabled: true });
    });

    test("returns credentialsEnabled: false when CREDS_PROVIDER is not 'true'", async () => {
      process.env.CREDS_PROVIDER = "false";

      const response = await providersGet();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ credentialsEnabled: false });
    });

    test("returns credentialsEnabled: false when CREDS_PROVIDER is undefined", async () => {
      delete process.env.CREDS_PROVIDER;

      const response = await providersGet();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ credentialsEnabled: false });
    });

    test("returns credentialsEnabled: false when CREDS_PROVIDER is empty string", async () => {
      process.env.CREDS_PROVIDER = "";

      const response = await providersGet();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ credentialsEnabled: false });
    });

    test("applies rate limiting and returns 429 when rate limit exceeded", async () => {
      // Mock rate limit exceeded
      const rateLimitResponse = {
        status: 429,
        json: vi.fn().mockResolvedValue({
          error: "Rate limit exceeded",
          message: "Too many requests. Limit: 10 requests per 60 s.",
          retryAfter: 30,
        }),
        headers: {
          get: vi.fn((header: string) => {
            const headers = {
              "X-RateLimit-Limit": "10",
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(Date.now() + 30000).toISOString(),
              "Retry-After": "30",
            };
            return headers[header];
          }),
        },
      };

      mockRateLimit.mockResolvedValue({
        success: false,
        response: rateLimitResponse,
      });

      const request = new NextRequest("http://localhost/api/auth/providers");
      const response = await providersGet(request);

      expect(response.status).toBe(429);
      expect(mockRateLimit).toHaveBeenCalledWith(request, "auth");

      const data = await response.json();
      expect(data.error).toBe("Rate limit exceeded");
      expect(data.message).toContain("Too many requests");
      expect(data.retryAfter).toBe(30);
    });

    test("applies rate limiting but proceeds normally when within limits", async () => {
      process.env.CREDS_PROVIDER = "true";

      const request = new NextRequest("http://localhost/api/auth/providers");
      const response = await providersGet(request);

      expect(response.status).toBe(200);
      expect(mockRateLimit).toHaveBeenCalledWith(request, "auth");

      const data = await response.json();
      expect(data).toEqual({ credentialsEnabled: true });
    });
  });
});

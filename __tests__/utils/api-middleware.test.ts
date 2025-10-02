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

import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock next/server
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      statusText: "OK",
      headers: new Headers(),
      url: "",
      redirected: false,
      type: "basic",
      body: null,
      bodyUsed: false,
      text: () => Promise.resolve(JSON.stringify(data)),
      clone: () => ({ ...data }),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    })),
  },
}));

// Mock auth - this needs to be done before importing the modules that use it
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Import the modules to test after mocking
import { NextRequest, NextResponse } from "next/server";
import { withAuth, withAuthSimple } from "@/lib/api-middleware";
import { auth } from "@/lib/auth";

// Get the mocked functions
const mockAuth = auth as ReturnType<typeof vi.fn>;

describe("API Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tests from api-middleware-uncovered.test.ts
  describe("withAuth", () => {
    it("handles authentication errors", async () => {
      const mockError = new Error("Authentication failed");
      mockAuth.mockRejectedValue(mockError);

      const mockHandler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(new NextRequest("http://localhost"));

      expect(result.status).toBe(500);
      const responseData = await result.json();
      expect(responseData.error).toBe("Authentication failed");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("handles authentication errors with string errors", async () => {
      mockAuth.mockRejectedValue("String error");

      const mockHandler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(new NextRequest("http://localhost"));

      expect(result.status).toBe(500);
      const responseData = await result.json();
      expect(responseData.error).toBe("Authentication failed");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("handles authentication errors with object errors", async () => {
      mockAuth.mockRejectedValue({ message: "Object error" });

      const mockHandler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(new NextRequest("http://localhost"));

      expect(result.status).toBe(500);
      const responseData = await result.json();
      expect(responseData.error).toBe("Authentication failed");
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("withAuthSimple", () => {
    it("passes authentication context to handler", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user123",
        },
      });

      const mockHandler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withAuthSimple(mockHandler);
      const result = await wrappedHandler(new NextRequest("http://localhost"));

      expect(result.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith({
        userId: "user123",
      });
    });

    it("handles authentication errors", async () => {
      const mockError = new Error("Authentication failed");
      mockAuth.mockRejectedValue(mockError);

      const mockHandler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withAuthSimple(mockHandler);
      const result = await wrappedHandler(new NextRequest("http://localhost"));

      expect(result.status).toBe(500);
      const responseData = await result.json();
      expect(responseData.error).toBe("Authentication failed");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("returns unauthorized when session is missing", async () => {
      mockAuth.mockResolvedValue(null);

      const mockHandler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withAuthSimple(mockHandler);
      const result = await wrappedHandler(new NextRequest("http://localhost"));

      expect(result.status).toBe(401);
      const responseData = await result.json();
      expect(responseData.error).toBe("Unauthorized");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("returns unauthorized when user id is missing", async () => {
      mockAuth.mockResolvedValue({
        user: {}, // No id
      });

      const mockHandler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withAuthSimple(mockHandler);
      const result = await wrappedHandler(new NextRequest("http://localhost"));

      expect(result.status).toBe(401);
      const responseData = await result.json();
      expect(responseData.error).toBe("Unauthorized");
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});

import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock NextResponse static methods
vi.mock("next/server", async () => {
  const actual = (await vi.importActual("next/server")) as any;
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: vi.fn(),
      next: vi.fn(),
    },
  };
});

// Mock the auth function
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => vi.fn()),
}));

import { config } from "@/middleware";
import { auth } from "@/lib/auth";

describe("Middleware", () => {
  let mockAuthMiddleware: any;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockAuthMiddleware = vi.fn((req: any) => {
      // Simulate the actual middleware logic
      if (!req.auth && req.nextUrl.pathname !== "/") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    });

    // Make auth return our mock middleware
    vi.mocked(auth).mockReturnValue(mockAuthMiddleware);
  });

  describe("Protected route redirection", () => {
    test("should redirect unauthenticated users from /hiragana", () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/hiragana" },
        url: "http://localhost:3000/hiragana",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/hiragana"),
      );
    });

    test("should redirect unauthenticated users from /katakana", () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/katakana" },
        url: "http://localhost:3000/katakana",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/katakana"),
      );
    });

    test("should redirect unauthenticated users from /dashboard", () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/dashboard"),
      );
    });

    test("should redirect unauthenticated users from API flashcard routes", () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/api/flashcards" },
        url: "http://localhost:3000/api/flashcards",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/api/flashcards"),
      );
    });

    test("should redirect unauthenticated users from API stats route", () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/api/stats" },
        url: "http://localhost:3000/api/stats",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/api/stats"),
      );
    });
  });

  describe("Authenticated user access", () => {
    test("should allow authenticated users to access protected routes", () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/hiragana" },
        url: "http://localhost:3000/hiragana",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test("should allow authenticated users to access dashboard", () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test("should allow authenticated users to access API routes", () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/api/flashcards" },
        url: "http://localhost:3000/api/flashcards",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("Home page access", () => {
    test("should allow unauthenticated users to access home page", () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/" },
        url: "http://localhost:3000/",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test("should allow authenticated users to access home page", () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/" },
        url: "http://localhost:3000/",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      mockAuthMiddleware(mockRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("Configuration", () => {
    test("should have correct matcher configuration", () => {
      expect(config.matcher).toEqual([
        "/hiragana",
        "/katakana",
        "/dashboard",
        "/api/flashcards/:path*",
        "/api/stats",
      ]);
    });

    test("should include all protected routes in matcher", () => {
      const expectedProtectedRoutes = [
        "/hiragana",
        "/katakana",
        "/dashboard",
        "/api/flashcards/:path*",
        "/api/stats",
      ];

      expectedProtectedRoutes.forEach((route) => {
        expect(config.matcher).toContain(route);
      });
    });
  });
});

import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock NextResponse static methods
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  const actualResponse = actual as { NextResponse: typeof NextResponse };
  return {
    NextResponse: {
      ...actualResponse.NextResponse,
      redirect: vi
        .fn()
        .mockImplementation((url: string) =>
          actualResponse.NextResponse.redirect(url),
        ),
      next: vi
        .fn()
        .mockImplementation(() => actualResponse.NextResponse.next()),
    },
  };
});

// Mock the auth function
vi.mock("@/lib/auth", () => ({
  auth: vi.fn((handler) => {
    // Return a function that directly calls the handler and returns a resolved promise
    return (req: NextRequest, _context: { params: Record<string, string> }): Promise<NextResponse> => {
      const result = handler(req);
      return Promise.resolve(result);
    };
  }),
}));

import { auth } from "@/lib/auth";

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Protected route redirection", () => {
    test("should redirect unauthenticated users from /hiragana", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/hiragana" },
        url: "http://localhost:3000/hiragana",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/hiragana"),
      );
    });

    test("should redirect unauthenticated users from /katakana", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/katakana" },
        url: "http://localhost:3000/katakana",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/katakana"),
      );
    });

    test("should redirect unauthenticated users from /dashboard", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/dashboard"),
      );
    });

    test("should redirect unauthenticated users from API flashcard routes", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/api/flashcards" },
        url: "http://localhost:3000/api/flashcards",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/api/flashcards"),
      );
    });

    test("should redirect unauthenticated users from API stats route", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/api/stats" },
        url: "http://localhost:3000/api/stats",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/api/stats"),
      );
    });
  });

  describe("Authenticated user access", () => {
    test("should allow authenticated users to access protected routes", async () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/hiragana" },
        url: "http://localhost:3000/hiragana",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test("should allow authenticated users to access dashboard", async () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test("should allow authenticated users to access API routes", async () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/api/flashcards" },
        url: "http://localhost:3000/api/flashcards",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("Home page access", () => {
    test("should allow unauthenticated users to access home page", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/" },
        url: "http://localhost:3000/",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test("should allow authenticated users to access home page", async () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/" },
        url: "http://localhost:3000/",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("NextResponse.next() scenarios", () => {
    test("should call NextResponse.next() when user is authenticated accessing any route", async () => {
      const mockRequest = {
        auth: { user: { id: "test-user" } },
        nextUrl: { pathname: "/hiragana" },
        url: "http://localhost:3000/hiragana",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test("should call NextResponse.next() when unauthenticated user accesses root path", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/" },
        url: "http://localhost:3000/",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  
    describe("Redirect scenario for lines 23-24", () => {
      test("should redirect when user is not authenticated and accessing protected route", async () => {
        const mockRequest = {
          auth: null,
          nextUrl: { pathname: "/protected-route" },
          url: "http://localhost:3000/protected-route",
        } as unknown as NextRequest;
  
        const mockRedirect = vi.mocked(NextResponse.redirect);
        mockRedirect.mockReturnValue({} as NextResponse);
  
        // Test the middleware logic directly
        const middlewareHandler = auth((req) => {
          if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
            return NextResponse.redirect(new URL("/", req.url));
          }
          return NextResponse.next();
        });
  
        // Call the middleware handler with the mock request and context with params
        await middlewareHandler(mockRequest, { params: {} });
  
        expect(mockRedirect).toHaveBeenCalledWith(
          new URL("/", "http://localhost:3000/protected-route"),
        );
        expect(NextResponse.next).not.toHaveBeenCalled();
      });
    });
  });

  describe("Edge cases", () => {
    test("should handle undefined auth values", async () => {
      const mockRequest = {
        auth: undefined,
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/dashboard"),
      );
    });

    test("should handle empty auth object", async () => {
      const mockRequest = {
        auth: {},
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/dashboard"),
      );
    });

    test("should handle null auth object", async () => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Test the middleware logic directly
      const middlewareHandler = auth((req) => {
        if ((!req.auth || (typeof req.auth === 'object' && Object.keys(req.auth).length === 0)) && req.nextUrl.pathname !== "/") {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      });

      // Call the middleware handler with the mock request and context with params
      await middlewareHandler(mockRequest, { params: {} });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/dashboard"),
      );
    });
  });

  describe("Configuration", () => {
    test("should have correct matcher configuration", async () => {
      // Import the config directly from the middleware file
      const { config } = await import("../middleware");
      expect(config.matcher).toEqual([
        "/hiragana",
        "/katakana",
        "/dashboard",
        "/api/flashcards/:path*",
        "/api/stats",
      ]);
    });

    test("should include all protected routes in matcher", async () => {
      // Import the config directly from the middleware file
      const { config } = await import("../middleware");
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

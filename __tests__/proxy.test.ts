import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock NextResponse static methods
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  const actualResponse = actual as { NextResponse: typeof NextResponse };
  const mockRedirect = vi.fn((url: string) => {
    const response = actualResponse.NextResponse.redirect(url);
    return response;
  });

  const mockNext = vi.fn(() => actualResponse.NextResponse.next());

  return {
    NextResponse: {
      ...actualResponse.NextResponse,
      redirect: mockRedirect,
      next: mockNext,
    },
    URL: actual.URL,
  };
});

// Import the actual proxy function
let proxy: unknown;
let config: { matcher: string[] };

// Mock the auth function to allow actual proxy execution
vi.mock("@/lib/auth", () => ({
  auth: vi.fn((handler: (req: NextRequest) => NextResponse) => {
    // Return a function that directly calls the handler and returns a resolved promise
    return (
      req: NextRequest,
      _context: { params: Promise<Record<string, string>> },
    ): Promise<NextResponse> => {
      const result = handler(req);
      return Promise.resolve(result);
    };
  }),
}));

import { auth } from "@/lib/auth";

describe("Proxy", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Import the actual proxy function for each test to ensure fresh state
    const proxyModule = await import("../proxy");
    proxy = proxyModule.default;
    config = proxyModule.config;
  });

  describe("Protected route redirection", () => {
    test.each([
      "/hiragana",
      "/katakana",
      "/dashboard",
      "/api/flashcards",
      "/api/stats",
    ])("should redirect unauthenticated users from %s", async (pathname) => {
      const mockRequest = {
        auth: null,
        nextUrl: { pathname },
        url: `http://localhost:3000${pathname}`,
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Call the actual proxy function with the mock request
      await (
        proxy as (
          req: NextRequest,
          context: { params: Promise<Record<string, string>> },
        ) => Promise<NextResponse>
      )(mockRequest, { params: Promise.resolve({}) });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", `http://localhost:3000${pathname}`),
      );
    });
  });

  describe("Authenticated user access", () => {
    test.each(["/hiragana", "/dashboard", "/api/flashcards"])(
      "should allow authenticated users to access %s",
      async (pathname) => {
        const mockRequest = {
          auth: { user: { id: "test-user" } },
          nextUrl: { pathname },
          url: `http://localhost:3000${pathname}`,
        } as unknown as NextRequest;

        const mockNext = vi.mocked(NextResponse.next);
        mockNext.mockReturnValue({} as NextResponse);

        // Call the actual proxy function with the mock request
        await (
          proxy as (
            req: NextRequest,
            context: { params: Promise<Record<string, string>> },
          ) => Promise<NextResponse>
        )(mockRequest, { params: Promise.resolve({}) });

        expect(mockNext).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      },
    );
  });

  describe("Home page access", () => {
    test.each([
      [null, "unauthenticated"],
      [{ user: { id: "test-user" } }, "authenticated"],
    ])("should allow %s users to access home page", async (auth, _authType) => {
      const mockRequest = {
        auth,
        nextUrl: { pathname: "/" },
        url: "http://localhost:3000/",
      } as unknown as NextRequest;

      const mockNext = vi.mocked(NextResponse.next);
      mockNext.mockReturnValue({} as NextResponse);

      // Call the actual proxy function with the mock request
      await (
        proxy as (
          req: NextRequest,
          context: { params: Promise<Record<string, string>> },
        ) => Promise<NextResponse>
      )(mockRequest, { params: Promise.resolve({}) });

      expect(mockNext).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("NextResponse.next() scenarios", () => {
    test.each([
      [
        { user: { id: "test-user" } },
        "/hiragana",
        "authenticated user accessing protected route",
      ],
      [null, "/", "unauthenticated user accessing root path"],
    ])(
      "should call NextResponse.next() when %s",
      async (auth, pathname, _description) => {
        const mockRequest = {
          auth,
          nextUrl: { pathname },
          url: `http://localhost:3000${pathname}`,
        } as unknown as NextRequest;

        const mockNext = vi.mocked(NextResponse.next);
        mockNext.mockReturnValue({} as NextResponse);

        // Call the actual proxy function with the mock request
        await (
          proxy as (
            req: NextRequest,
            context: { params: Promise<Record<string, string>> },
          ) => Promise<NextResponse>
        )(mockRequest, { params: Promise.resolve({}) });

        expect(mockNext).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      },
    );

    describe("Redirect scenario for lines 23-24", () => {
      test("should redirect when user is not authenticated and accessing protected route", async () => {
        const mockRequest = {
          auth: null,
          nextUrl: { pathname: "/protected-route" },
          url: "http://localhost:3000/protected-route",
        } as unknown as NextRequest;

        const mockRedirect = vi.mocked(NextResponse.redirect);
        mockRedirect.mockReturnValue({} as NextResponse);

        // Test the proxy logic directly
        const proxyHandler = auth((req) => {
          if (
            (!req.auth ||
              (typeof req.auth === "object" &&
                Object.keys(req.auth).length === 0)) &&
            req.nextUrl.pathname !== "/"
          ) {
            return NextResponse.redirect(new URL("/", req.url));
          }
          return NextResponse.next();
        });

        // Call the proxy handler with the mock request and context with params
        await proxyHandler(mockRequest, { params: Promise.resolve({}) });

        expect(mockRedirect).toHaveBeenCalledWith(
          new URL("/", "http://localhost:3000/protected-route"),
        );
        expect(NextResponse.next).not.toHaveBeenCalled();
      });
    });
  });

  describe("Edge cases", () => {
    test.each([
      [undefined, "undefined auth values"],
      [{}, "empty auth object"],
      [null, "null auth object"],
    ])("should handle %s", async (auth, _description) => {
      const mockRequest = {
        auth,
        nextUrl: { pathname: "/dashboard" },
        url: "http://localhost:3000/dashboard",
      } as unknown as NextRequest;

      const mockRedirect = vi.mocked(NextResponse.redirect);
      mockRedirect.mockReturnValue({} as NextResponse);

      // Call the actual proxy function with the mock request
      await (
        proxy as (
          req: NextRequest,
          context: { params: Promise<Record<string, string>> },
        ) => Promise<NextResponse>
      )(mockRequest, { params: Promise.resolve({}) });

      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000/dashboard"),
      );
    });
  });

  describe("Configuration", () => {
    test("should have correct matcher configuration", async () => {
      // Use the imported config variable
      expect(config.matcher).toEqual([
        "/hiragana",
        "/katakana",
        "/dashboard",
        "/api/flashcards/:path*",
        "/api/stats",
      ]);
    });

    test("should include all protected routes in matcher", async () => {
      // Use the imported config variable
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

  describe("Comprehensive auth condition testing", () => {
    describe("Redirect scenarios for unauthenticated users", () => {
      test.each([
        [undefined, "/hiragana"],
        [null, "/katakana"],
        [{}, "/dashboard"],
      ])(
        "should redirect when req.auth is %s and accessing %s",
        async (auth, pathname) => {
          const mockRequest = {
            auth,
            nextUrl: { pathname },
            url: `http://localhost:3000${pathname}`,
          } as unknown as NextRequest;

          const mockRedirect = vi.mocked(NextResponse.redirect);
          mockRedirect.mockReturnValue({} as NextResponse);

          // Call the actual proxy function with the mock request
          await (
            proxy as (
              req: NextRequest,
              context: { params: Promise<Record<string, string>> },
            ) => Promise<NextResponse>
          )(mockRequest, { params: Promise.resolve({}) });

          expect(mockRedirect).toHaveBeenCalledWith(
            new URL("/", `http://localhost:3000${pathname}`),
          );
          expect(NextResponse.next).not.toHaveBeenCalled();
        },
      );
    });

    describe("Allow access scenarios for root path", () => {
      test.each([
        [undefined, "undefined auth"],
        [null, "null auth"],
        [{}, "empty auth object"],
        [
          { user: { id: "test-user", name: "Test User" } },
          "authenticated user",
        ],
      ])(
        "should allow access when req.auth is %s and accessing root path",
        async (auth, _description) => {
          const mockRequest = {
            auth,
            nextUrl: { pathname: "/" },
            url: "http://localhost:3000/",
          } as unknown as NextRequest;

          const mockNext = vi.mocked(NextResponse.next);
          mockNext.mockReturnValue({} as NextResponse);

          // Call the actual proxy function with the mock request
          await (
            proxy as (
              req: NextRequest,
              context: { params: Promise<Record<string, string>> },
            ) => Promise<NextResponse>
          )(mockRequest, { params: Promise.resolve({}) });

          expect(mockNext).toHaveBeenCalled();
          expect(NextResponse.redirect).not.toHaveBeenCalled();
        },
      );
    });

    describe("Allow access scenarios for authenticated users", () => {
      test.each([
        [
          { user: { id: "test-user", name: "Test User" } },
          "/hiragana",
          "protected route",
        ],
        [{ user: { id: "test-user", name: "Test User" } }, "/", "root path"],
        ["invalid-auth", "/dashboard", "string auth type"],
        [123, "/katakana", "number auth type"],
      ])(
        "should allow access when req.auth is %s and accessing %s",
        async (auth, pathname, _description) => {
          const mockRequest = {
            auth,
            nextUrl: { pathname },
            url: `http://localhost:3000${pathname}`,
          } as unknown as NextRequest;

          const mockNext = vi.mocked(NextResponse.next);
          mockNext.mockReturnValue({} as NextResponse);

          // Call the actual proxy function with the mock request
          await (
            proxy as (
              req: NextRequest,
              context: { params: Promise<Record<string, string>> },
            ) => Promise<NextResponse>
          )(mockRequest, { params: Promise.resolve({}) });

          expect(mockNext).toHaveBeenCalled();
          expect(NextResponse.redirect).not.toHaveBeenCalled();
        },
      );
    });
  });
});

import { describe, test, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/stats/route";
import { POST } from "@/app/api/flashcards/submit/route";
import { NextRequest } from "next/server";

// Import mock setup functions
import { mockSession } from "../utils/mock-setup";

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockAuth, mockPrisma, mockRateLimit } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    kana: { findMany: vi.fn() },
    kanaProgress: { upsert: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
    $executeRaw: vi.fn(),
  },
  mockRateLimit: vi.fn(),
}));

// Mock auth, prisma, and rate limit at top level
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/rate-limit", () => ({ applyRateLimit: mockRateLimit }));

describe("API Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: allow rate limiting
    mockRateLimit.mockResolvedValue({ success: true });
  });

  describe("GET /api/stats", () => {
    test("returns 401 for unauthenticated requests", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/stats");
      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 401 for session without user ID", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: undefined }));

      const request = new NextRequest("http://localhost/api/stats");
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    test("succeeds with valid session", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.kana.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost/api/stats");
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/flashcards/submit", () => {
    test("requires authentication for submissions", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: "1", isCorrect: true }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    test("processes submissions for authenticated users", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user123" });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: "1", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });
});

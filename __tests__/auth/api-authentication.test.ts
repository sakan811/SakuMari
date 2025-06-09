import { describe, test, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/flashcards/route";
import { POST } from "@/app/api/flashcards/submit/route";
import { NextRequest } from "next/server";

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    kana: { findMany: vi.fn() },
    kanaProgress: { upsert: vi.fn(), update: vi.fn() },
  },
}));

// Mock auth and prisma at top level
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("API Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/flashcards", () => {
    test("returns 401 for unauthenticated requests", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 401 for session without user ID", async () => {
      mockAuth.mockResolvedValue({ user: {} });

      const response = await GET();
      expect(response.status).toBe(401);
    });

    test("succeeds with valid session", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.kana.findMany.mockResolvedValue([]);

      const response = await GET();
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
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.kanaProgress.upsert.mockResolvedValue({
        id: "1",
        attempts: 1,
        correct_attempts: 1,
      });

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

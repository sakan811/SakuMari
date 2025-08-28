import { describe, test, expect, vi } from "vitest";
import { GET } from "@/app/api/stats/route";
import { POST } from "@/app/api/flashcards/submit/route";
import { NextRequest } from "next/server";
import { setupApiTest } from "../utils/test-helpers";

// Set up API test mocks
setupApiTest();

describe("API Authentication", async () => {
  // Import the mocked functions after mocking
  const { auth } = await import("@/lib/auth");
  const { prisma } = await import("@/lib/prisma");

  describe("GET /api/stats", () => {
    test("returns 401 for unauthenticated requests", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await GET();
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 401 for session without user ID", async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} });

      const response = await GET();
      expect(response.status).toBe(401);
    });

    test("succeeds with valid session", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      vi.mocked(prisma.kana.findMany).mockResolvedValue([]);

      const response = await GET();
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/flashcards/submit", () => {
    test("requires authentication for submissions", async () => {
      vi.mocked(auth).mockResolvedValue(null);

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
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      vi.mocked(prisma.kanaProgress.upsert).mockResolvedValue({
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

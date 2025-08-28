import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../../app/api/flashcards/submit/route";
import { NextRequest } from "next/server";
import { setupApiTest } from "../utils/test-helpers";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kanaProgress: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Flashcards API", async () => {
  // Import the mocked functions after mocking
  const { auth } = await import("@/lib/auth");
  const { prisma } = await import("@/lib/prisma");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/flashcards/submit", () => {
    test("creates progress record", async () => {
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
      expect(prisma.kanaProgress.upsert).toHaveBeenCalled();
    });

    test("handles database connection errors", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      vi.mocked(prisma.kanaProgress.upsert).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: "1", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    test("handles Prisma constraint errors", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      const constraintError = new Error("Unique constraint failed");
      constraintError.name = "PrismaClientKnownRequestError";
      vi.mocked(prisma.kanaProgress.upsert).mockRejectedValue(constraintError);

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: "1", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });


    test("handles missing kanaId in request body", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    test("handles missing isCorrect in request body", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: "1" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    test("handles invalid data types in request body", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: 123, isCorrect: "true" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    test("handles malformed JSON in request body", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: "{ invalid json }",
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    test("handles empty request body", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: "",
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});

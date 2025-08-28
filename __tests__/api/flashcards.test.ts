import { describe, test, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { setupApiTest } from "../utils/test-helpers";

// Set up API test mocks
const { getMocks } = setupApiTest();

describe("Flashcards API", async () => {
  let auth: any;
  let prisma: any;
  let POST: any;

  beforeAll(async () => {
    ({ auth, prisma } = await getMocks());
    // Dynamically import the route handler after mocks are set up
    const routeModule = await import("../../app/api/flashcards/submit/route");
    POST = routeModule.POST;
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe("POST /api/flashcards/submit", () => {
    test("returns 401 for unauthenticated requests", async () => {
      // Mock unauthenticated user
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: "1", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    test("returns 401 for session without user ID", async () => {
      // Mock session without user ID
      vi.mocked(auth).mockResolvedValue({ user: {} });

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({ kanaId: "1", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    test("creates progress record", async () => {
      // Mock authenticated user
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
      // Mock authenticated user
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
      // Mock authenticated user
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
      // Mock authenticated user
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
      // Mock authenticated user
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
      // Mock authenticated user
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
      // Mock authenticated user
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
      // Mock authenticated user
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

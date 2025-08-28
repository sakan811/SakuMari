import { describe, test, expect, vi } from "vitest";
import { setupApiTest } from "../utils/test-helpers";
import * as apiHelpers from "@/lib/api-helpers";

vi.mock('@/lib/api-helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    withErrorHandling: vi.fn((handler) => {
      // Mock withErrorHandling to wrap the handler with proper error handling
      return async (...args: any[]) => {
        try {
          return await handler(...args);
        } catch (error) {
          console.error("Mocked error:", error);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      };
    }),
    createErrorResponse: vi.fn((message, status) => {
      return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { "Content-Type": "application/json" } }
      );
    }),
  };
});

// Set up API test mocks
const { getMocks } = setupApiTest();

describe("Stats API Route", async () => {
  let auth: any;
  let prisma: any;
  let GET: any;

  beforeAll(async () => {
    ({ auth, prisma } = await getMocks());
    // Dynamically import the route handler after mocks are set up
    const routeModule = await import("../../app/api/stats/route");
    GET = routeModule.GET;
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe("GET /api/stats", () => {
    test("returns complete stats for authenticated user", async () => {
      // Mock authenticated user
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      
      const mockStatsData = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          progress: [
            {
              attempts: 10,
              correct_attempts: 8,
              accuracy: 0.8,
            },
          ],
        },
        {
          id: "2",
          character: "い",
          romaji: "i",
          progress: [], // No progress yet
        },
      ];

      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        {
          id: "1",
          character: "あ",
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "2",
          character: "い",
          romaji: "i",
          attempts: 0,
          correct_attempts: 0,
          accuracy: 0,
        },
      ]);
    });

    test("returns 401 for unauthenticated requests", async () => {
      // Mock unauthenticated user
      vi.mocked(auth).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 401 for session without user ID", async () => {
      // Mock session without user ID
      vi.mocked(auth).mockResolvedValue({ user: {} });

      const response = await GET();

      expect(response.status).toBe(401);
    });

    test("handles user with no practice data", async () => {
      // Mock authenticated user
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      
      const mockStatsData = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          progress: [],
        },
        {
          id: "2",
          character: "い",
          romaji: "i",
          progress: [],
        },
      ];

      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data.every((stat) => stat.attempts === 0)).toBe(true);
      expect(data.every((stat) => stat.accuracy === 0)).toBe(true);
    });

    test("handles database connection errors", async () => {
      // Mock authenticated user
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      
      vi.mocked(prisma.kana.findMany).mockRejectedValue(
        new Error("Database connection lost"),
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    test("handles Prisma query timeout errors", async () => {
      // Mock authenticated user
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      
      const timeoutError = new Error("Query timeout");
      timeoutError.name = "PrismaClientKnownRequestError";
      vi.mocked(prisma.kana.findMany).mockRejectedValue(timeoutError);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    test("correctly filters user-specific progress", async () => {
      // Mock authenticated user
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      
      vi.mocked(prisma.kana.findMany).mockResolvedValue([]);

      await GET();

      expect(prisma.kana.findMany).toHaveBeenCalledWith({
        include: {
          progress: {
            where: {
              user_id: "user123",
            },
            select: {
              attempts: true,
              correct_attempts: true,
              accuracy: true,
            },
          },
        },
      });
    });

    test("handles edge case with zero attempts but non-zero accuracy", async () => {
      // Mock authenticated user
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      
      // This shouldn't happen in normal flow but tests data integrity
      const mockStatsData = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          progress: [
            {
              attempts: 0,
              correct_attempts: 0,
              accuracy: 0.5, // This is inconsistent data
            },
          ],
        },
      ];

      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0]).toEqual({
        id: "1",
        character: "あ",
        romaji: "a",
        attempts: 0,
        correct_attempts: 0,
        accuracy: 0.5, // Returns data as-is, doesn't try to "fix" it
      });
    });
  });
});
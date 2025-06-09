import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../../app/api/stats/route";

// Use direct function declaration pattern that works reliably with vitest
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kana: {
      findMany: vi.fn(),
    },
  },
}));

describe("Stats API Route", async () => {
  // Import the mocked functions after mocking
  const { auth } = await import("@/lib/auth");
  const { prisma } = await import("@/lib/prisma");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/stats", () => {
    test("returns 401 when user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 401 when user session has no ID", async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    test("returns complete stats for authenticated user", async () => {
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

      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
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

    test("handles user with no practice data", async () => {
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

      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data.every((stat) => stat.attempts === 0)).toBe(true);
      expect(data.every((stat) => stat.accuracy === 0)).toBe(true);
    });

    test("handles database connection errors", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
      vi.mocked(prisma.kana.findMany).mockRejectedValue(
        new Error("Database connection lost"),
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    test("correctly filters user-specific progress", async () => {
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

      vi.mocked(auth).mockResolvedValue({ user: { id: "user123" } });
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
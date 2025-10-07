import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { GET } from "../../app/api/stats/route";
import { NextRequest } from "next/server";
import { applyRateLimit } from "../../lib/rate-limit";

// Define type for stats response
interface StatResponse {
  id: string;
  character: string;
  romaji: string;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
}

// Use direct function declaration pattern that works reliably with vitest
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kana: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: vi.fn(),
}));

describe("Stats API Route", async () => {
  // Import the mocked functions after mocking
  const { auth } = await import("@/lib/auth");
  const { prisma } = await import("@/lib/prisma");

  // Import mock setup functions
  const { mockSession } = await import("../utils/mock-setup");

  beforeEach(async () => {
    vi.clearAllMocks();
    // Default: allow rate limiting
    const { applyRateLimit } = await import("@/lib/rate-limit");
    vi.mocked(applyRateLimit).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/stats", () => {
    test("returns 401 when user is not authenticated", async () => {
      (auth as Mock).mockResolvedValue(mockSession(false));
      const response1 = await GET(
        new NextRequest("http://localhost/api/stats"),
      );

      const data = await response1.json();

      expect(response1.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 401 when user session has no ID", async () => {
      (auth as Mock).mockResolvedValue(mockSession(true, { id: undefined }));

      const response2 = await GET(
        new NextRequest("http://localhost/api/stats"),
      );
      const data = await response2.json();

      expect(response2.status).toBe(401);
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

      (auth as Mock).mockResolvedValue(mockSession(true, { id: "user123" }));
      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const response3 = await GET(
        new NextRequest("http://localhost/api/stats"),
      );
      const data = await response3.json();

      expect(response3.status).toBe(200);
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

      (auth as Mock).mockResolvedValue(mockSession(true, { id: "user123" }));
      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const response4 = await GET(
        new NextRequest("http://localhost/api/stats"),
      );
      const data = await response4.json();

      expect(response4.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data.every((stat: StatResponse) => stat.attempts === 0)).toBe(
        true,
      );
      expect(data.every((stat: StatResponse) => stat.accuracy === 0)).toBe(
        true,
      );
    });

    test("handles database connection errors", async () => {
      (auth as Mock).mockResolvedValue(mockSession(true, { id: "user123" }));
      vi.mocked(prisma.kana.findMany).mockRejectedValue(
        new Error("Database connection lost"),
      );

      const response5 = await GET(
        new NextRequest("http://localhost/api/stats"),
      );
      const data = await response5.json();

      expect(response5.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    test("correctly filters user-specific progress", async () => {
      (auth as Mock).mockResolvedValue(mockSession(true, { id: "user123" }));
      vi.mocked(prisma.kana.findMany).mockResolvedValue([]);

      await GET(new NextRequest("http://localhost/api/stats"));

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

      (auth as Mock).mockResolvedValue(mockSession(true, { id: "user123" }));
      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const response6 = await GET(
        new NextRequest("http://localhost/api/stats"),
      );
      const data = await response6.json();

      expect(response6.status).toBe(200);
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

  describe("Rate Limiting", () => {
    test("should return rate limit response when rate limit is exceeded", async () => {
      // Setup
      (auth as Mock).mockResolvedValue(mockSession(true, { id: "user123" }));
      vi.mocked(applyRateLimit).mockResolvedValue({
        success: false,
        response: new Response("Too Many Requests", { status: 429 }) as any,
      });

      const request = new NextRequest("http://localhost/api/stats");

      // Execute
      const response = await GET(request);

      // Verify
      expect(response.status).toBe(429);
      expect(applyRateLimit).toHaveBeenCalledWith(request, "stats", "user123");
    });

    test("should proceed when rate limit allows request", async () => {
      // Setup
      const mockStatsData = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          progress: [
            {
              attempts: 5,
              correct_attempts: 4,
              accuracy: 0.8,
            },
          ],
        },
      ];
      (auth as Mock).mockResolvedValue(mockSession(true, { id: "user123" }));
      vi.mocked(applyRateLimit).mockResolvedValue({
        success: true,
      });
      vi.mocked(prisma.kana.findMany).mockResolvedValue(mockStatsData);

      const request = new NextRequest("http://localhost/api/stats");

      // Execute
      const response = await GET(request);

      // Verify
      expect(response.status).toBe(200);
      expect(applyRateLimit).toHaveBeenCalledWith(request, "stats", "user123");
    });
  });
});

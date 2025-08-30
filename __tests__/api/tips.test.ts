/*
 * SakuMari - Japanese Kana Flashcard App
 * Copyright (C) 2025  Sakan Nirattisaykul
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../../app/api/tips/route";

// Using any for test mocks to avoid complex NextAuth type conflicts
type MockAuthSession = any;

// Use direct function declaration pattern that works reliably with vitest
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kanaProgress: {
      findMany: vi.fn(),
    },
  },
}));

// Mock Google Generative AI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn();
const mockGoogleGenerativeAI = vi.fn();

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: mockGoogleGenerativeAI,
}));

describe("Tips API Route", async () => {
  // Import the mocked functions after mocking
  const { auth } = await import("@/lib/auth");
  const { prisma } = await import("@/lib/prisma");

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default environment variables
    process.env.GEMINI_API_KEY = "test-api-key";
    process.env.MODEL_NAME = "gemini-2.5-flash-lite";

    // Setup default mock behavior
    mockGenerateContent.mockResolvedValue({
      response: {
        text: vi.fn().mockReturnValue("Mocked AI response for learning tips"),
      },
    });

    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    });

    mockGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
    delete process.env.MODEL_NAME;
  });

  describe("POST /api/tips", () => {
    test("returns 401 when user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to learn hiragana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 401 when user session has no ID", async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} } as MockAuthSession);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to learn hiragana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 400 when userQuery is missing", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Please provide a question about Japanese kana learning",
      );
    });

    test("returns 400 when userQuery is empty string", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Please provide a question about Japanese kana learning",
      );
    });

    test("returns 400 when userQuery is only whitespace", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "   " }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Please provide a question about Japanese kana learning",
      );
    });

    test("returns 400 when userQuery exceeds character limit", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);

      const longQuery = "a".repeat(501); // Over 500 character limit

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: longQuery }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Question too long. Please keep it under 500 characters.",
      );
    });

    test("fetches user progress data successfully", async () => {
      const mockUserProgress = [
        {
          id: "progress-1",
          kana_id: "kana-1",
          user_id: "user123",
          attempts: 10,
          correct_attempts: 5,
          accuracy: 0.5,
          kana: { character: "あ", romaji: "a" },
        },
        {
          id: "progress-2",
          kana_id: "kana-2",
          user_id: "user123",
          attempts: 8,
          correct_attempts: 7,
          accuracy: 0.9,
          kana: { character: "か", romaji: "ka" },
        },
      ];

      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue(
        mockUserProgress,
      );

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to improve my hiragana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tip).toBe("Mocked AI response for learning tips");
      expect(data.timestamp).toBeDefined();

      // Verify database query was made correctly
      expect(prisma.kanaProgress.findMany).toHaveBeenCalledWith({
        where: {
          user_id: "user123",
        },
        include: {
          kana: true,
        },
        orderBy: {
          accuracy: "asc",
        },
      });
    });

    test("handles users with no practice data", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue([]);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to start learning kana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tip).toBe("Mocked AI response for learning tips");
    });

    test("returns 503 when GEMINI_API_KEY is missing", async () => {
      delete process.env.GEMINI_API_KEY;

      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue([]);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to learn kana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe(
        "AI service not configured. Please contact support.",
      );
    });

    test("returns 500 when AI service fails", async () => {
      // Override the mock to throw an error
      mockGenerateContent.mockRejectedValue(new Error("AI service error"));

      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue([]);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to learn kana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Unable to generate learning tips. Please try again later.",
      );
    });

    test("returns 500 when AI returns empty response", async () => {
      // Override the mock to return empty response
      mockGenerateContent.mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue(""),
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue([]);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to learn kana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Unable to generate learning tips at this time. Please try again.",
      );
    });

    test("handles database errors gracefully", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockRejectedValue(
        new Error("Database connection lost"),
      );

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "How to learn kana?" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Unable to generate learning tips. Please try again later.",
      );
    });

    test("accepts optional conversationHistory parameter", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue([]);

      const conversationHistory = [
        { role: "user", content: "Previous question" },
        { role: "assistant", content: "Previous answer" },
      ];

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: "Follow-up question",
          conversationHistory,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tip).toBe("Mocked AI response for learning tips");
    });

    test("includes user progress context in AI prompt", async () => {
      const mockUserProgress = [
        {
          id: "progress-3",
          kana_id: "kana-3",
          user_id: "user123",
          attempts: 10,
          correct_attempts: 3,
          accuracy: 0.3, // Struggling
          kana: { character: "あ", romaji: "a" },
        },
        {
          id: "progress-4",
          kana_id: "kana-4",
          user_id: "user123",
          attempts: 8,
          correct_attempts: 8,
          accuracy: 0.95, // Mastered
          kana: { character: "か", romaji: "ka" },
        },
      ];

      // Override the mock to return context-aware response
      mockGenerateContent.mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue("Context-aware response"),
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue(
        mockUserProgress,
      );

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "Help me improve" }),
      });

      await POST(request);

      // Verify AI was called with context including user progress
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining("あ (a): 30% accuracy"),
      );
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining("か (ka): 95% accuracy"),
      );
    });

    test("returns proper response format", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user123" },
      } as MockAuthSession);
      vi.mocked(prisma.kanaProgress.findMany).mockResolvedValue([]);

      const request = new Request("http://localhost/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: "Test question" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("tip");
      expect(data).toHaveProperty("timestamp");
      expect(typeof data.tip).toBe("string");
      expect(typeof data.timestamp).toBe("string");

      // Verify timestamp is valid ISO string
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });
});

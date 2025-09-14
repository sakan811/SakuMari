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

import { describe, test, expect, vi, beforeEach } from "vitest";
import { POST } from "../../app/api/flashcards/submit/route";
import { handleSubmissionError } from "../../lib/flashcard-submit-utils";
import { NextRequest } from "next/server";
import {
  createFlashcardSubmitRequest,
  setupDatabaseError,
} from "../utils/api-test-setup";
import {
  expectSuccess,
  expectUnauthorized,
  expectBadRequest,
  expectServerError,
  expectCalledTimes,
  expectNotCalled,
  expectSqlContains,
  expectSqlParameters,
} from "../utils/test-assertions";

// Create mocks directly in the test file
const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    kana: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    kanaProgress: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

// Mock the modules
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("Flashcard Submit API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Database Operations", () => {
    test("INSERT case: creates new KanaProgress record when none exists for correct answer", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = createFlashcardSubmitRequest("test-1", true);

      // Execute
      const response = await POST(request);

      // Verify
      expectSuccess(response);
      expectCalledTimes(mockPrisma.$executeRaw, 1);

      // Verify the SQL parameters for INSERT case
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      expectSqlContains(mockCall, 'INSERT INTO "KanaProgress"');
      expectSqlContains(mockCall, 'ON CONFLICT (kana_id, user_id)');
      expectSqlParameters(mockCall, [
        "test-1", // kanaId
        "user123", // userId
        1, // attempts
        1, // correct_attempts (isCorrect: true)
        1.0, // accuracy (isCorrect: true)
        1, // increment for correct_attempts in UPDATE
      ]);
    });

    test("INSERT case: creates new KanaProgress record for incorrect answer", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = createFlashcardSubmitRequest("test-2", false);

      // Execute
      const response = await POST(request);

      // Verify
      expectSuccess(response);
      expectCalledTimes(mockPrisma.$executeRaw, 1);

      // Verify the SQL parameters for INSERT case with incorrect answer
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      expectSqlContains(mockCall, 'INSERT INTO "KanaProgress"');
      expectSqlContains(mockCall, 'ON CONFLICT (kana_id, user_id)');
      expectSqlParameters(mockCall, [
        "test-2", // kanaId
        "user123", // userId
        0, // attempts (isCorrect: false)
        0, // correct_attempts (isCorrect: false)
        0.0, // accuracy (isCorrect: false)
        0, // increment for correct_attempts in UPDATE
      ]);
    });

    test("UPDATE case: updates existing KanaProgress record for correct answer", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = createFlashcardSubmitRequest("test-3", true);

      // Execute
      const response = await POST(request);

      // Verify
      expectSuccess(response);
      expectCalledTimes(mockPrisma.$executeRaw, 1);

      // Verify the SQL parameters for UPDATE case with correct answer
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      expectSqlContains(mockCall, 'ON CONFLICT (kana_id, user_id)');
      expectSqlContains(mockCall, 'DO UPDATE SET');
      expectSqlContains(mockCall, 'attempts = "KanaProgress".attempts + 1');
      expectSqlContains(mockCall, 'correct_attempts = "KanaProgress".correct_attempts +');
      expectSqlParameters(mockCall, [
        "test-3", // kanaId
        "user123", // userId
        1, // attempts
        1, // correct_attempts (isCorrect: true)
        1.0, // accuracy (isCorrect: true)
        1, // increment for correct_attempts in UPDATE
      ]);
    });

    test("UPDATE case: updates existing KanaProgress record for incorrect answer", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = createFlashcardSubmitRequest("test-4", false);

      // Execute
      const response = await POST(request);

      // Verify
      expectSuccess(response);
      expectCalledTimes(mockPrisma.$executeRaw, 1);

      // Verify the SQL parameters for UPDATE case with incorrect answer
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      expectSqlContains(mockCall, 'ON CONFLICT (kana_id, user_id)');
      expectSqlContains(mockCall, 'DO UPDATE SET');
      expectSqlContains(mockCall, 'attempts = "KanaProgress".attempts + 1');
      expectSqlContains(mockCall, 'correct_attempts = "KanaProgress".correct_attempts +');
      expectSqlParameters(mockCall, [
        "test-4", // kanaId
        "user123", // userId
        0, // attempts (isCorrect: false)
        0, // correct_attempts (isCorrect: false)
        0.0, // accuracy (isCorrect: false)
        0, // increment for correct_attempts in UPDATE
      ]);
    });
  });

  describe("Success Response Tests", () => {
    test("returns success response for correct answer", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = createFlashcardSubmitRequest("test-1", true);

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Verify
      expectSuccess(response);
      expect(data).toEqual({ success: true });
      expectCalledTimes(mockPrisma.$executeRaw, 1);
    });

    test("returns success response for incorrect answer", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = createFlashcardSubmitRequest("test-2", false);

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Verify
      expectSuccess(response);
      expect(data).toEqual({ success: true });
      expectCalledTimes(mockPrisma.$executeRaw, 1);
    });

    test("handles successful database operation", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = createFlashcardSubmitRequest("test-1", true);

      // Execute
      const response = await POST(request);

      // Verify
      expectSuccess(response);
      expectCalledTimes(mockPrisma.$executeRaw, 1);
    });
  });

  describe("Error Handling Tests", () => {
    test("handles database connection errors", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      setupDatabaseError(mockPrisma, "Database connection failed");

      const request = createFlashcardSubmitRequest("test-1", true);

      // Execute
      const response = await POST(request);

      // Verify
      expectServerError(response);
    });

    test("requires authentication", async () => {
      // Setup
      mockAuth.mockResolvedValue(null);

      const request = createFlashcardSubmitRequest("test-1", true);

      // Execute
      const response = await POST(request);

      // Verify
      expectUnauthorized(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles missing kanaId in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles missing isCorrect in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1" }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles invalid data types in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: 123, isCorrect: "true" }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles malformed JSON in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "{ invalid json }",
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles empty request body", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "",
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles non-JSON content type", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "kanaId=test-1&isCorrect=true",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });
  });

  describe("Edge Cases", () => {
    test("handles very long kanaId", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const longKanaId = "a".repeat(1000);
      const request = createFlashcardSubmitRequest(longKanaId, true);

      // Execute
      const response = await POST(request);

      // Verify
      expectSuccess(response);
      expectCalledTimes(mockPrisma.$executeRaw, 1);
    });

    test("handles boolean isCorrect as string", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: "true" }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles numeric kanaId as string", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "123", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectSuccess(response);
      expectCalledTimes(mockPrisma.$executeRaw, 1);
    });

    test("handles null values in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: null, isCorrect: null }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });

    test("handles undefined values in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue({ user: { id: "user123" } });

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: undefined, isCorrect: undefined }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expectBadRequest(response);
      expectNotCalled(mockPrisma.$executeRaw);
    });
  });

  describe("Error Handling Function Tests", () => {
    test("handleSubmissionError returns bad request for Invalid JSON error", () => {
      // Setup
      const error = new Error("Invalid JSON: Unexpected token");

      // Execute
      const response = handleSubmissionError(error);

      // Verify
      expectBadRequest(response);
    });

    test("handleSubmissionError returns bad request for error containing Invalid JSON", () => {
      // Setup
      const error = new Error("Something went wrong - Invalid JSON detected");

      // Execute
      const response = handleSubmissionError(error);

      // Verify
      expectBadRequest(response);
    });

    test("handleSubmissionError returns internal error for non-Error objects", () => {
      // Setup
      const error = "string error";

      // Execute
      const response = handleSubmissionError(error);

      // Verify
      expectServerError(response);
    });

    test("handleSubmissionError returns internal error for null", () => {
      // Setup
      const error = null;

      // Execute
      const response = handleSubmissionError(error);

      // Verify
      expectServerError(response);
    });

    test("handleSubmissionError returns internal error for undefined", () => {
      // Setup
      const error = undefined;

      // Execute
      const response = handleSubmissionError(error);

      // Verify
      expectServerError(response);
    });

    test("handleSubmissionError returns internal error for Error without Invalid JSON message", () => {
      // Setup
      const error = new Error("Database connection failed");

      // Execute
      const response = handleSubmissionError(error);

      // Verify
      expectServerError(response);
    });

    test("handleSubmissionError returns internal error for generic Error object", () => {
      // Setup
      const error = new Error("Some other error");

      // Execute
      const response = handleSubmissionError(error);

      // Verify
      expectServerError(response);
    });
  });
});
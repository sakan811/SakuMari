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
import { NextRequest } from "next/server";
import { mockSession } from "../utils/mock-setup";

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    $executeRaw: vi.fn((strings: readonly string[], ...values: any[]) => {
      // Create a mock object that simulates the tagged template literal structure
      // Also store the strings and values for later inspection
      return {
        strings,
        values,
      };
    }) as any,
  },
}));

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("Flashcard Submit API - Database Operations", () => {
  describe("POST /api/flashcards/submit", () => {
    beforeEach(() => {
      // Reset all mocks before each test
      vi.clearAllMocks();
    });
    test("INSERT case: creates new KanaProgress record when none exists", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(200);
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Verify the SQL parameters for INSERT case
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      const callResult = mockPrisma.$executeRaw.mock.results[0].value;
      const strings = mockCall[0];
      const values = mockCall.slice(1);
      const fullSql = strings.join('');
      expect(fullSql).toContain('INSERT INTO "KanaProgress"');
      expect(fullSql).toContain('ON CONFLICT (kana_id, user_id)');
      expect(values).toEqual([
        "test-1", // kanaId
        "user123", // userId
        1, // attempts
        1, // correct_attempts (isCorrect: true)
        1.0, // accuracy (isCorrect: true)
        1, // increment for correct_attempts in UPDATE
      ]);
    });

    test("INSERT case: creates new KanaProgress record with incorrect answer", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-2", isCorrect: false }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(200);
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Verify the SQL parameters for INSERT case with incorrect answer
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      const strings = mockCall[0];
      const values = mockCall.slice(1);
      const fullSql = strings.join('');
      expect(fullSql).toContain('INSERT INTO "KanaProgress"');
      expect(fullSql).toContain('ON CONFLICT (kana_id, user_id)');
      expect(values).toEqual([
        "test-2", // kanaId
        "user123", // userId
        0, // attempts (isCorrect: false)
        0, // correct_attempts (isCorrect: false)
        0.0, // accuracy (isCorrect: false)
        0, // increment for correct_attempts in UPDATE
      ]);
    });

    test("UPDATE case: updates existing KanaProgress record with correct answer", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-3", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(200);
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Verify the SQL parameters for UPDATE case with correct answer
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      const strings = mockCall[0];
      const values = mockCall.slice(1);
      const fullSql = strings.join('');
      expect(fullSql).toContain('ON CONFLICT (kana_id, user_id)');
      expect(fullSql).toContain('DO UPDATE SET');
      expect(fullSql).toContain('attempts = "KanaProgress".attempts + 1');
      // Check that the SQL contains the correct pattern for updating correct_attempts
      expect(fullSql).toContain('correct_attempts = "KanaProgress".correct_attempts +');
      expect(values).toEqual([
        "test-3", // kanaId
        "user123", // userId
        1, // attempts
        1, // correct_attempts (isCorrect: true)
        1.0, // accuracy (isCorrect: true)
        1, // increment for correct_attempts in UPDATE
      ]);
    });

    test("UPDATE case: updates existing KanaProgress record with incorrect answer", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-4", isCorrect: false }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(200);
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Verify the SQL parameters for UPDATE case with incorrect answer
      const mockCall = mockPrisma.$executeRaw.mock.calls[0];
      const strings = mockCall[0];
      const values = mockCall.slice(1);
      const fullSql = strings.join('');
      expect(fullSql).toContain('ON CONFLICT (kana_id, user_id)');
      expect(fullSql).toContain('DO UPDATE SET');
      expect(fullSql).toContain('attempts = "KanaProgress".attempts + 1');
      // Check that the SQL contains the correct pattern for updating correct_attempts
      expect(fullSql).toContain('correct_attempts = "KanaProgress".correct_attempts +');
      expect(values).toEqual([
        "test-4", // kanaId
        "user123", // userId
        0, // attempts (isCorrect: false)
        0, // correct_attempts (isCorrect: false)
        0.0, // accuracy (isCorrect: false)
        0, // increment for correct_attempts in UPDATE
      ]);
    });

    test("handles database connection errors", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(500);
    });

    test("requires authentication", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(false));

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(401);
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    });

    test("handles missing kanaId in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(400);
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    });

    test("handles missing isCorrect in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1" }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(400);
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    });

    test("handles invalid data types in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: 123, isCorrect: "true" }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(400);
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    });

    test("handles malformed JSON in request body", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "{ invalid json }",
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);

      // Verify
      expect(response.status).toBe(400);
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    });

    describe("Success Response Tests", () => {
      test("returns NextResponse.json({ success: true }) for correct answer", async () => {
        // Setup
        mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
        mockPrisma.$executeRaw.mockResolvedValue(undefined);

        const request = new NextRequest("http://localhost/api/flashcards/submit", {
          method: "POST",
          body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        });

        // Execute
        const response = await POST(request);
        const responseData = await response.json();

        // Verify success response structure
        expect(response.status).toBe(200);
        expect(responseData).toEqual({ success: true });
        expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      });

      test("returns NextResponse.json({ success: true }) for incorrect answer", async () => {
        // Setup
        mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
        mockPrisma.$executeRaw.mockResolvedValue(undefined);

        const request = new NextRequest("http://localhost/api/flashcards/submit", {
          method: "POST",
          body: JSON.stringify({ kanaId: "test-2", isCorrect: false }),
          headers: { "Content-Type": "application/json" },
        });

        // Execute
        const response = await POST(request);
        const responseData = await response.json();

        // Verify success response structure
        expect(response.status).toBe(200);
        expect(responseData).toEqual({ success: true });
        expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      });

      test("verifies response status code is 200 for successful operations", async () => {
        // Setup
        mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
        mockPrisma.$executeRaw.mockResolvedValue(undefined);

        const request = new NextRequest("http://localhost/api/flashcards/submit", {
          method: "POST",
          body: JSON.stringify({ kanaId: "test-3", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        });

        // Execute
        const response = await POST(request);

        // Verify status code
        expect(response.status).toBe(200);
        expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      });

      test("verifies response body structure matches { success: true }", async () => {
        // Setup
        mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
        mockPrisma.$executeRaw.mockResolvedValue(undefined);

        const request = new NextRequest("http://localhost/api/flashcards/submit", {
          method: "POST",
          body: JSON.stringify({ kanaId: "test-4", isCorrect: false }),
          headers: { "Content-Type": "application/json" },
        });

        // Execute
        const response = await POST(request);
        const responseData = await response.json();

        // Verify response body structure
        expect(responseData).toHaveProperty("success");
        expect(responseData.success).toBe(true);
        expect(Object.keys(responseData)).toHaveLength(1);
        expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      });

      test("ensures success response is returned after $executeRaw operation completes", async () => {
        // Setup
        mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
        
        // Mock $executeRaw to return a promise that resolves after a delay
        let executeRawResolved = false;
        mockPrisma.$executeRaw.mockImplementation((strings: readonly string[], ...values: any[]) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              executeRawResolved = true;
              resolve({ strings, values });
            }, 10);
          });
        }) as any;

        const request = new NextRequest("http://localhost/api/flashcards/submit", {
          method: "POST",
          body: JSON.stringify({ kanaId: "test-5", isCorrect: true }),
          headers: { "Content-Type": "application/json" },
        });

        // Execute
        const response = await POST(request);
        const responseData = await response.json();

        // Verify $executeRaw completed before success response
        expect(executeRawResolved).toBe(true);
        expect(response.status).toBe(200);
        expect(responseData).toEqual({ success: true });
        expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Error Handling Tests", () => {
    beforeEach(() => {
      // Reset all mocks before each test
      vi.clearAllMocks();
    });

    test("handles Invalid JSON error with proper status code and message", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "{ invalid json }",
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Invalid request format",
        code: "BAD_REQUEST",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        expect.any(Error)
      );
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("handles database errors with proper status code and message", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockRejectedValue(new Error("Database connection failed"));
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        expect.any(Error)
      );
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("properly catches errors in try-catch block", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const requestObj = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "{ invalid json }",
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(requestObj);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Invalid request format",
        code: "BAD_REQUEST",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        expect.any(Error)
      );
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("returns appropriate status codes for different error types", async () => {
      // Test 400 status code for invalid JSON
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      
      const invalidJsonRequest = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "{ invalid json }",
        headers: { "Content-Type": "application/json" },
      });
      
      let response = await POST(invalidJsonRequest);
      expect(response.status).toBe(400);
      
      // Reset mocks and setup for database error test
      vi.clearAllMocks();
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockRejectedValue(new Error("Database error"));
      
      const dbErrorRequest = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });
      
      response = await POST(dbErrorRequest);
      expect(response.status).toBe(500);
    });

    test("ensures console.error is called with expected error message", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      const testError = new Error("Test database error");
      mockPrisma.$executeRaw.mockRejectedValue(testError);
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      await POST(request);

      // Verify
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        testError
      );
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("handles generic Error instance that doesn't match specific error messages", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.$executeRaw.mockRejectedValue(new Error("Generic database error"));
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });

      // Execute
      const response = await POST(request);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        expect.any(Error)
      );
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("handles Error instance without 'Invalid JSON' message to cover line 74 - returns 400", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      
      // Create a mock request that will throw an Error instance during JSON parsing
      // but with a message that doesn't contain "Invalid JSON"
      const requestWithJsonError = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "{ invalid json }",
        headers: { "Content-Type": "application/json" },
      });
      
      // Mock the request.json() method to throw an Error with a different message
      const originalJson = requestWithJsonError.json;
      requestWithJsonError.json = vi.fn().mockRejectedValue(new Error("Unexpected token"));
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      // Execute
      const response = await POST(requestWithJsonError);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Invalid request format",
        code: "BAD_REQUEST",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        expect.any(Error)
      );
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("handles generic JSON parsing error that doesn't contain 'Invalid JSON' message", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      
      // Create a request with malformed JSON that will cause JSON parsing to fail
      // with an error message that doesn't contain "Invalid JSON"
      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: "{ malformed: json, missing: closing brace",
        headers: { "Content-Type": "application/json" },
      });
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      // Execute
      const response = await POST(request);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Invalid request format",
        code: "BAD_REQUEST",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        expect.any(Error)
      );
      expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("handles Error instance that doesn't contain 'Invalid JSON' in message to cover line 74", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      
      // Create a request with valid JSON
      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });
      
      // Make prisma.$executeRaw throw an error that doesn't contain "Invalid JSON"
      mockPrisma.$executeRaw.mockRejectedValue(new Error("Database connection failed"));
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      // Execute
      const response = await POST(request);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(500); // Should be 500 since the error doesn't contain "Invalid JSON"
      expect(responseData).toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        expect.any(Error)
      );
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    test("handles non-Error object to cover line 74 where error instanceof Error is false", async () => {
      // Setup
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      
      // Create a request with valid JSON
      const request = new NextRequest("http://localhost/api/flashcards/submit", {
        method: "POST",
        body: JSON.stringify({ kanaId: "test-1", isCorrect: true }),
        headers: { "Content-Type": "application/json" },
      });
      
      // Make prisma.$executeRaw throw a non-Error object (a string in this case)
      mockPrisma.$executeRaw.mockRejectedValue("Database connection failed");
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      // Execute
      const response = await POST(request);
      const responseData = await response.json();

      // Verify
      expect(response.status).toBe(500); // Should be 500 since the error is not an Error instance
      expect(responseData).toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        "Database connection failed"
      );
      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
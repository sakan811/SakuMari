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
    $executeRaw: vi.fn((strings: readonly string[], ...values: unknown[]) => {
      // Create a mock object that simulates the tagged template literal structure
      // Also store the strings and values for later inspection
      return {
        strings,
        values,
      };
    }) as ReturnType<typeof vi.fn>,
  },
}));

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("Flashcard Submit API - Error Handling Tests", () => {
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
    const _originalJson = requestWithJsonError.json;
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
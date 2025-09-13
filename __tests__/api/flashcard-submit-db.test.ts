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

describe("Flashcard Submit API - Database Operations", () => {
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
});
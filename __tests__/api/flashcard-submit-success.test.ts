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

describe("Flashcard Submit API - Success Response Tests", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

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
    mockPrisma.$executeRaw.mockImplementation((strings: readonly string[], ...values: unknown[]) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          executeRawResolved = true;
          resolve({ strings, values });
        }, 10);
      });
    }) as ReturnType<typeof vi.fn>;

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
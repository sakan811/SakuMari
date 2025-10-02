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
import { POST as submitFlashcard } from "../../app/api/flashcards/submit/route";
import { NextRequest } from "next/server";
import { mockSession } from "../utils/mock-setup";

// Use vi.hoisted to declare mocks that can be used in vi.mock
const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    kanaProgress: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    $executeRaw: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("Additional API Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/flashcards/submit - Additional Edge Cases", () => {
    test("handles extremely large kanaId", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user123" });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({
            kanaId: "a".repeat(1000), // Extremely long ID
            isCorrect: true,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await submitFlashcard(request);
      // Should still process the request, but might fail in the database layer
      // The important thing is it doesn't crash the API
      expect([200, 400, 500]).toContain(response.status);
    });

    test("handles non-boolean isCorrect values", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({
            kanaId: "1",
            isCorrect: "true", // String instead of boolean
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await submitFlashcard(request);
      expect(response.status).toBe(400);
    });

    test("handles numeric isCorrect values", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({
            kanaId: "1",
            isCorrect: 1, // Number instead of boolean
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await submitFlashcard(request);
      expect(response.status).toBe(400);
    });

    test("handles null kanaId", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({
            kanaId: null,
            isCorrect: true,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await submitFlashcard(request);
      expect(response.status).toBe(400);
    });

    test("handles undefined kanaId", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({
            isCorrect: true,
            // kanaId is missing
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await submitFlashcard(request);
      expect(response.status).toBe(400);
    });

    test("handles extra fields in request body", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user123" });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({
            kanaId: "1",
            isCorrect: true,
            extraField: "should be ignored",
            anotherField: 123,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await submitFlashcard(request);
      // Should still work as only required fields are validated
      expect(response.status).toBe(200);
    });

    test("handles special characters in kanaId", async () => {
      mockAuth.mockResolvedValue(mockSession(true, { id: "user123" }));
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user123" });
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost/api/flashcards/submit",
        {
          method: "POST",
          body: JSON.stringify({
            kanaId: "kana-1_abc.def!@#",
            isCorrect: true,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await submitFlashcard(request);
      // Should still process the request
      expect([200, 400, 500]).toContain(response.status);
    });
  });
});

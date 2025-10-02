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

import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { handleSubmissionError } from "@/lib/flashcard-submit-utils";

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      statusText: "OK",
      headers: new Headers(),
      url: "",
      redirected: false,
      type: "basic",
      body: null,
      bodyUsed: false,
      text: () => Promise.resolve(JSON.stringify(data)),
      clone: () => ({ ...data }),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    })),
  },
}));

// Mock console.error to avoid noise in test output
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("handleSubmissionError", () => {
  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe("Error instance handling", () => {
    it("should handle generic Error with Invalid JSON message", async () => {
      const error = new Error("Invalid JSON in request");
      const result = handleSubmissionError(error);

      expect(result.status).toBe(400);
      await expect(result.json()).resolves.toEqual({
        error: "Invalid request format",
        code: "BAD_REQUEST",
      });
    });

    it("should handle generic Error without Invalid JSON message", async () => {
      const error = new Error("Some other error");
      const result = handleSubmissionError(error);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });
  });

  describe("Prisma foreign key constraint violations", () => {
    it("should handle Prisma P2010 error (Raw query failed - foreign key constraint)", async () => {
      const prismaError = {
        name: "PrismaClientKnownRequestError",
        code: "P2010",
        message: "Foreign key constraint failed on field: user_id",
      };

      const result = handleSubmissionError(prismaError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Foreign key constraint violation - user may not exist in database:",
        prismaError.message,
      );
      expect(result.status).toBe(401);
      await expect(result.json()).resolves.toEqual({
        error: "User not found",
        message: "Your user account could not be found in the database. Please sign in again.",
      });
    });

    it("should handle Prisma P2003 error (Foreign key constraint violation)", async () => {
      const prismaError = {
        name: "PrismaClientKnownRequestError",
        code: "P2003",
        message: "Foreign key constraint violation on constraint: KanaProgress_user_id_fkey",
      };

      const result = handleSubmissionError(prismaError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Foreign key constraint violation - user may not exist in database:",
        prismaError.message,
      );
      expect(result.status).toBe(401);
      await expect(result.json()).resolves.toEqual({
        error: "User not found",
        message: "Your user account could not be found in the database. Please sign in again.",
      });
    });

    it("should handle other Prisma errors with fallback", async () => {
      const prismaError = {
        name: "PrismaClientKnownRequestError",
        code: "P2002",
        message: "Unique constraint failed on field: email",
      };

      const result = handleSubmissionError(prismaError);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });

    it("should handle Prisma error that is not a foreign key constraint", async () => {
      const prismaError = {
        name: "PrismaClientKnownRequestError",
        code: "P2025",
        message: "Record not found",
      };

      const result = handleSubmissionError(prismaError);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });
  });

  describe("Non-Error objects", () => {
    it("should handle string errors", async () => {
      const error = "Some string error";
      const result = handleSubmissionError(error);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });

    it("should handle null errors", async () => {
      const error = null;
      const result = handleSubmissionError(error);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });

    it("should handle undefined errors", async () => {
      const error = undefined;
      const result = handleSubmissionError(error);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });

    it("should handle object without name property", async () => {
      const error = {
        code: "P2003",
        message: "Some constraint violation",
      };

      const result = handleSubmissionError(error);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });
  });

  describe("Fallback handling", () => {
    it("should handle unknown error types", async () => {
      const error = 12345;
      const result = handleSubmissionError(error);

      expect(result.status).toBe(500);
      await expect(result.json()).resolves.toEqual({
        error: "Failed to submit flashcard answer",
        code: "INTERNAL_ERROR",
      });
    });
  });
});
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

import { NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-errors";

export function handleSubmissionError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.message.includes("Invalid JSON")) {
      return ApiErrors.badRequest("Invalid request format");
    }
  }

  // Handle Prisma foreign key constraint violations
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "PrismaClientKnownRequestError"
  ) {
    const prismaError = error as unknown as { code: string; message: string };

    // P2010: Raw query failed (foreign key constraint violation)
    // P2003: Foreign key constraint violation
    if (prismaError.code === "P2010" || prismaError.code === "P2003") {
      console.error(
        "Foreign key constraint violation - user may not exist in database:",
        prismaError.message,
      );

      // Return a simple error message
      return NextResponse.json(
        {
          error: "User not found",
          message:
            "Your user account could not be found in the database. Please sign in again.",
        },
        { status: 401 },
      );
    }
  }

  return ApiErrors.internalError("Failed to submit flashcard answer");
}

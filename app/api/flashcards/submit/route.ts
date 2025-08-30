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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedContext } from "@/lib/api-middleware";
import { ApiErrors, validateRequired, validateTypes } from "@/lib/api-errors";

async function submitAnswer(request: NextRequest, context: AuthenticatedContext) {
  try {
    const requestBody = await request.json().catch(() => {
      throw new Error("Invalid JSON");
    });

    const { kanaId, isCorrect } = requestBody;

    // Validate required fields
    const requiredValidation = validateRequired(requestBody, ["kanaId", "isCorrect"]);
    if (requiredValidation) return requiredValidation;

    // Validate field types
    const typeValidation = validateTypes(requestBody, {
      isCorrect: (value) => typeof value === "boolean",
    });
    if (typeValidation) return typeValidation;

    // Simple progress tracking - find or create KanaProgress record
    const kanaProgress = await prisma.kanaProgress.upsert({
      where: {
        kana_id_user_id: {
          kana_id: kanaId,
          user_id: context.userId,
        },
      },
      update: {
        attempts: { increment: 1 },
        correct_attempts: isCorrect ? { increment: 1 } : undefined,
      },
      create: {
        kana_id: kanaId,
        user_id: context.userId,
        attempts: 1,
        correct_attempts: isCorrect ? 1 : 0,
      },
    });

    // Calculate and update accuracy
    const accuracy = kanaProgress.correct_attempts / kanaProgress.attempts;

    await prisma.kanaProgress.update({
      where: { id: kanaProgress.id },
      data: { accuracy },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting answer:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Invalid JSON")) {
        return ApiErrors.badRequest("Invalid request format");
      }
    }
    
    return ApiErrors.internalError("Failed to submit flashcard answer");
  }
}

export const POST = withAuth(submitAnswer);

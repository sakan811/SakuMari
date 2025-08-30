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
import { ApiErrors } from "@/lib/api-errors";

async function getStats(_request: NextRequest, context: AuthenticatedContext) {
  try {
    // Single query with joins to get all data at once for the authenticated user
    const kanaWithProgress = await prisma.kana.findMany({
      include: {
        progress: {
          where: {
            user_id: context.userId,
          },
          select: {
            attempts: true,
            correct_attempts: true,
            accuracy: true,
          },
        },
      },
    });

    // Transform the data
    const result = kanaWithProgress.map((kana) => {
      const progress = kana.progress[0]; // Should be 0 or 1 record for this user
      return {
        id: kana.id,
        character: kana.character,
        romaji: kana.romaji,
        attempts: progress?.attempts || 0,
        correct_attempts: progress?.correct_attempts || 0,
        accuracy: progress?.accuracy || 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return ApiErrors.internalError("Failed to fetch user statistics");
  }
}

export const GET = withAuth(getStats);

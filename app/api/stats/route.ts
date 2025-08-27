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
import { prisma } from "@/lib/prisma";
import { handleAuth, withErrorHandling } from "@/lib/api-helpers";

async function handleGetStats() {
  const authResult = await handleAuth();
  if (!("userId" in authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  // Single query with joins to get all data at once for the authenticated user
  const kanaWithProgress = await prisma.kana.findMany({
    include: {
      progress: {
        where: {
          user_id: userId,
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
}

export const GET = withErrorHandling(handleGetStats, "fetching stats");

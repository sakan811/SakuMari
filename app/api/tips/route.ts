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
import { withAuth, AuthenticatedContext } from "@/lib/api-middleware";
import { prisma } from "@/lib/prisma";
import { TipsApiErrors } from "@/lib/api-errors";

interface ConversationMessage {
  role: string;
  content: string;
}

// Initialize Gemini AI client
async function createGeminiClient() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not configured");
  }

  return new GoogleGenerativeAI(apiKey);
}

async function generateTips(
  request: NextRequest,
  context: AuthenticatedContext,
) {
  try {
    const { userQuery, conversationHistory = [] } = await request.json();

    if (
      !userQuery ||
      typeof userQuery !== "string" ||
      userQuery.trim().length === 0
    ) {
      return TipsApiErrors.missingUserQuery();
    }

    // Rate limiting check - simple in-memory approach
    const maxLength = 500;
    if (userQuery.length > maxLength) {
      return TipsApiErrors.queryTooLong(maxLength);
    }

    // Fetch user's kana progress data
    const userProgress = await prisma.kanaProgress.findMany({
      where: {
        user_id: context.userId,
      },
      include: {
        kana: true,
      },
      orderBy: {
        accuracy: "asc", // Show struggling characters first
      },
    });

    // Prepare user progress context with simple accuracy categories
    const strugglingKana = userProgress
      .filter((p) => p.attempts > 0 && p.accuracy < 0.7)
      .slice(0, 5);

    const progressingKana = userProgress
      .filter((p) => p.attempts > 0 && p.accuracy >= 0.7 && p.accuracy < 0.9)
      .slice(0, 5);

    const masteringKana = userProgress
      .filter((p) => p.attempts > 0 && p.accuracy >= 0.9)
      .slice(0, 5);

    const progressContext = `
User Progress:
${strugglingKana.length > 0 ? `Needs Practice: ${strugglingKana.map((p) => `${p.kana.character} (${Math.round(p.accuracy * 100)}%)`).join(", ")}` : ""}
${progressingKana.length > 0 ? `Making Progress: ${progressingKana.map((p) => `${p.kana.character} (${Math.round(p.accuracy * 100)}%)`).join(", ")}` : ""}
${masteringKana.length > 0 ? `Mastering: ${masteringKana.map((p) => `${p.kana.character} (${Math.round(p.accuracy * 100)}%)`).join(", ")}` : ""}
`;

    // Format conversation history for context
    const conversationContext =
      conversationHistory.length > 0
        ? `\n\nPrevious conversation:\n${conversationHistory.map((msg: ConversationMessage) => `${msg.role}: ${msg.content}`).join("\n")}`
        : "";

    const genAI = await createGeminiClient();
    const model = genAI.getGenerativeModel({ model: process.env.MODEL_NAME });

    const systemPrompt = `You are a helpful Japanese language learning assistant specializing in Hiragana and Katakana (kana). 

Your role is to provide personalized, practical learning tips and advice about Japanese kana based on the user's progress data. Keep your responses focused ONLY on:
- Learning techniques for memorizing kana characters
- Practice strategies for hiragana and katakana
- Common mistakes and how to avoid them  
- Mnemonic devices and memory techniques
- Writing and recognition tips
- Personalized advice based on user's struggling and mastered characters

IMPORTANT: If asked about anything other than Japanese kana learning (like grammar, vocabulary, culture, etc.), politely redirect back to kana-specific learning topics.

${progressContext}${conversationContext}

Keep responses concise (under 300 words), friendly, and educational. Use the user's progress data to provide personalized recommendations.

User question: ${userQuery}`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return TipsApiErrors.generationFailed();
    }

    return NextResponse.json({
      tip: text.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating kana learning tips:", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return TipsApiErrors.aiServiceNotConfigured();
    }

    return TipsApiErrors.generationError();
  }
}

export const POST = withAuth(generateTips);

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

import type { KanaFilter } from "@/types/kana";

export const UNICODE_RANGES = {
  HIRAGANA: { start: 0x3040, end: 0x309f },
  KATAKANA: { start: 0x30a0, end: 0x30ff },
} as const;

export const isKanaType = (char: string, type: KanaFilter): boolean => {
  if (type === "all") return true;
  const code = char.charCodeAt(0);
  
  return type === "hiragana"
    ? code >= UNICODE_RANGES.HIRAGANA.start && code <= UNICODE_RANGES.HIRAGANA.end
    : code >= UNICODE_RANGES.KATAKANA.start && code <= UNICODE_RANGES.KATAKANA.end;
};

export const getKanaType = (char: string): KanaFilter => {
  const code = char.charCodeAt(0);
  if (code >= UNICODE_RANGES.HIRAGANA.start && code <= UNICODE_RANGES.HIRAGANA.end) {
    return "hiragana";
  }
  if (code >= UNICODE_RANGES.KATAKANA.start && code <= UNICODE_RANGES.KATAKANA.end) {
    return "katakana";
  }
  return "all";
};

export const kanaConstants = {
  filters: {
    all: "all" as const,
    hiragana: "hiragana" as const,
    katakana: "katakana" as const,
  },
  
  sortColumns: {
    character: "character" as const,
    romaji: "romaji" as const,
    attempts: "attempts" as const,
    correctAttempts: "correct_attempts" as const,
    accuracy: "accuracy" as const,
  },
} as const;
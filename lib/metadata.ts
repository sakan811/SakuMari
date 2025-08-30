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

import { Metadata } from "next";

/**
 * Creates consistent metadata for kana practice pages
 * @param kanaType - The type of kana (hiragana or katakana)
 * @returns Metadata object for the kana practice page
 */
export function createKanaPageMetadata(kanaType: "hiragana" | "katakana"): Metadata {
  const title = kanaType === "hiragana" 
    ? "Hiragana Practice | SakuMari" 
    : "Katakana Practice | SakuMari";
    
  const description = kanaType === "hiragana"
    ? "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols and improve your reading skills."
    : "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols used for foreign words and names.";
    
  const kanaScript = kanaType === "hiragana" ? "あいうえお" : "アイウエオ";
  
  return {
    title,
    description,
    keywords: [
      kanaType.charAt(0).toUpperCase() + kanaType.slice(1),
      "Japanese characters",
      "flashcards",
      "practice",
      "learning",
      kanaScript,
    ],
    alternates: {
      canonical: `/${kanaType}`,
    },
    openGraph: {
      title,
      description: `Practice Japanese ${kanaType.charAt(0).toUpperCase() + kanaType.slice(1)} characters with interactive flashcards. Master all 46 basic ${kanaType.charAt(0).toUpperCase() + kanaType.slice(1)} symbols.`,
      url: `/${kanaType}`,
    },
    twitter: {
      title,
      description: `Practice Japanese ${kanaType.charAt(0).toUpperCase() + kanaType.slice(1)} characters with interactive flashcards. Master all 46 basic ${kanaType.charAt(0).toUpperCase() + kanaType.slice(1)} symbols.`,
    },
  };
}
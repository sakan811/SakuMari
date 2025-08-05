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
import FlashcardApp from "@/components/FlashcardApp";

export const metadata: Metadata = {
  title: "Katakana Practice",
  description:
    "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols used for foreign words and names.",
  keywords: [
    "Katakana",
    "Japanese characters",
    "flashcards",
    "practice",
    "learning",
    "アイウエオ",
  ],
  alternates: {
    canonical: "/katakana",
  },
  openGraph: {
    title: "Katakana Practice | SakuMari",
    description:
      "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols.",
    url: "/katakana",
  },
  twitter: {
    title: "Katakana Practice | SakuMari",
    description:
      "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols.",
  },
};

export default function KatakanaPage() {
  return <FlashcardApp kanaType="katakana" />;
}

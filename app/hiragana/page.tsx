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
  title: "Hiragana Practice | SakuMari",
  description:
    "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols and improve your reading skills.",
  keywords: [
    "Hiragana",
    "Japanese characters",
    "flashcards",
    "practice",
    "learning",
    "あいうえお",
  ],
  alternates: {
    canonical: "/hiragana",
  },
  openGraph: {
    title: "Hiragana Practice | SakuMari",
    description:
      "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols.",
    url: "/hiragana",
  },
  twitter: {
    title: "Hiragana Practice | SakuMari",
    description:
      "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols.",
  },
};

export default function HiraganaPage() {
  return <FlashcardApp kanaType="hiragana" />;
}

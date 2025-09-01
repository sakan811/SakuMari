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

export const metadata: Metadata = {
  description:
    "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress in this free educational app.",
  keywords: [
    "Japanese",
    "Hiragana",
    "Katakana",
    "flashcards",
    "learn Japanese",
    "kana practice",
    "Japanese alphabet",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sakumari.fukudev.org",
    title: "SakuMari - Master Japanese Kana",
    description:
      "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress.",
    siteName: "SakuMari",
  },
  twitter: {
    card: "summary_large_image",
    title: "SakuMari - Master Japanese Kana",
    description:
      "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress.",
  },
};

// Move the HomePage component content directly here
import HomePage from "@/components/HomePage";

export default function Home() {
  return <HomePage />;
}

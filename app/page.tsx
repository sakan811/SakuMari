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
    "Master Japanese Hiragana and Katakana with interactive flashcards. Free educational app to learn Japanese characters with progress tracking.",
  keywords: [
    "Japanese",
    "Hiragana",
    "Katakana",
    "flashcards",
    "learn Japanese",
    "kana practice",
    "Japanese alphabet",
    "Japanese learning",
    "learn Japanese free",
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
      "Master Japanese Hiragana and Katakana with interactive flashcards. Free educational app to learn Japanese characters.",
    siteName: "SakuMari",
  },
  twitter: {
    card: "summary_large_image",
    title: "SakuMari - Master Japanese Kana",
    description:
      "Master Japanese Hiragana and Katakana with interactive flashcards. Free educational app to learn Japanese characters.",
  },
};

// Move the HomePage component content directly here
import HomePage from "@/components/HomePage";

export default function Home() {
  return <HomePage />;
}

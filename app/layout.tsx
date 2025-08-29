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
import React from "react";
import "./globals.css";
import Providers from "@/components/SessionProviders";

export const metadata: Metadata = {
  title: {
    default: "SakuMari - Master Japanese Kana",
    template: "%s | SakuMari",
  },
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
  authors: [{ name: "Sakan Nirattisaykul" }],
  creator: "Sakan Nirattisaykul",
  publisher: "SakuMari",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sakumari.fukudev.org/"),
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-[#fad182] via-[#f5c55a] to-[#fad182] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

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

interface MetadataConfig {
  title: string;
  description: string;
  path?: string;
  keywords?: readonly string[];
  siteName?: string;
  locale?: string;
  type?: "website" | "article";
  imageUrl?: string;
  noIndex?: boolean;
}

const DEFAULT_CONFIG = {
  siteName: "SakuMari",
  locale: "en_US",
  type: "website" as const,
  baseUrl: "https://sakumari.fukudev.org",
  defaultKeywords: [
    "Japanese",
    "Hiragana",
    "Katakana",
    "flashcards",
    "learn Japanese",
    "kana practice",
    "Japanese alphabet",
  ],
};

/**
 * Creates consistent metadata for pages with SEO optimization
 */
export function createMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  siteName = DEFAULT_CONFIG.siteName,
  locale = DEFAULT_CONFIG.locale,
  type = DEFAULT_CONFIG.type,
  imageUrl,
  noIndex = false,
}: MetadataConfig): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const baseUrl = path === "/" ? DEFAULT_CONFIG.baseUrl.replace(/\/$/, "") : DEFAULT_CONFIG.baseUrl;
  const canonicalUrl = `${baseUrl}${path}`;
  const combinedKeywords = [...DEFAULT_CONFIG.defaultKeywords, ...keywords];

  return {
    title: fullTitle,
    description,
    keywords: combinedKeywords,
    alternates: {
      canonical: path,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      type,
      locale,
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName,
      ...(imageUrl && { images: [{ url: imageUrl, alt: title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

/**
 * Common metadata configurations for different page types
 */
export const METADATA_PRESETS = {
  hiragana: {
    title: "Hiragana Practice",
    description:
      "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols and improve your reading skills.",
    path: "/hiragana",
    keywords: [
      "Hiragana",
      "Japanese characters",
      "flashcards",
      "practice",
      "learning",
      "あいうえお",
    ],
  },
  katakana: {
    title: "Katakana Practice",
    description:
      "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols used for foreign words and names.",
    path: "/katakana",
    keywords: [
      "Katakana",
      "Japanese characters",
      "flashcards",
      "practice",
      "learning",
      "アイウエオ",
    ],
  },
  dashboard: {
    title: "Dashboard - Your Progress",
    description:
      "Track your Japanese Kana learning progress. View your statistics, accuracy, and performance metrics.",
    path: "/dashboard",
    keywords: [
      "progress tracking",
      "statistics",
      "learning analytics",
      "Japanese study",
    ],
    noIndex: true,
  },
  home: {
    title: "SakuMari - Master Japanese Kana",
    description:
      "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress in this free educational app.",
    path: "/",
    keywords: [],
  },
} as const;

/**
 * Creates metadata using predefined presets
 */
export function createPresetMetadata(
  preset: keyof typeof METADATA_PRESETS,
): Metadata {
  return createMetadata(METADATA_PRESETS[preset]);
}

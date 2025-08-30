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

/**
 * Centralized background gradient utilities for consistent theming
 * Eliminates duplication of gradient background classes across components
 */

export const backgrounds = {
  // Main application backgrounds
  main: {
    // Full screen background with via point - used for main pages
    fullscreen:
      "min-h-screen bg-gradient-to-br from-[#fad182] via-[#f5c55a] to-[#fad182]",
    // Simple two-color background - used for dashboard and other pages
    simple: "min-h-screen bg-gradient-to-br from-[#fad182] to-[#f5c55a]",
    // Container background without min-height
    container: "bg-gradient-to-br from-[#fad182] to-[#f5c55a]",
  },

  // Component backgrounds
  card: {
    // Flashcard background
    flashcard:
      "bg-gradient-to-br from-[#fad182] via-[#fad182] to-[#f5c55a] shadow-xl border-2 border-[#705a39]",
    // Light overlay for modal content areas
    overlay: "bg-gradient-to-br from-[#fad182]/10 to-[#f5c55a]/10",
  },

  // Button/interactive element backgrounds
  button: {
    // Primary red button (translucent)
    primaryTranslucent: "bg-gradient-to-br from-[#d1622b]/80 to-[#ae0d13]/80",
    primaryTranslucentHover: "hover:from-[#d1622b] hover:to-[#ae0d13]",
    // Primary red button (solid)
    primary: "bg-gradient-to-br from-[#d1622b] to-[#ae0d13]",
    // Brown button
    brown: "bg-gradient-to-br from-[#705a39] to-[#403933]",
    // Success/green button
    success: "bg-gradient-to-br from-green-600 to-green-700",
  },

  // Status/progress indicators
  progress: {
    // Struggling/needs work
    struggling: "bg-gradient-to-br from-[#705a39] to-[#403933]",
    // Good progress
    good: "bg-gradient-to-br from-green-600 to-green-700",
    // Excellent progress
    excellent: "bg-gradient-to-br from-[#d1622b] to-[#ae0d13]",
  },
} as const;

// Helper function to combine background classes with additional styles
export function bg(
  backgroundKey: keyof typeof backgrounds,
  variant?: string,
  additionalClasses?: string,
): string {
  const backgroundGroup = backgrounds[backgroundKey];
  if (typeof backgroundGroup === "string") {
    return [backgroundGroup, additionalClasses].filter(Boolean).join(" ");
  }

  if (variant && variant in backgroundGroup) {
    const bgClass = (backgroundGroup as Record<string, string>)[variant];
    return [bgClass, additionalClasses].filter(Boolean).join(" ");
  }

  throw new Error(
    `Invalid background key: ${backgroundKey}${variant ? `.${variant}` : ""}`,
  );
}

// Type-safe background class generator
export function createBg<T extends keyof typeof backgrounds>(
  category: T,
): (typeof backgrounds)[T] extends string
  ? () => (typeof backgrounds)[T]
  : (variant: keyof (typeof backgrounds)[T]) => string {
  const backgroundGroup = backgrounds[category];

  if (typeof backgroundGroup === "string") {
    return (() => backgroundGroup) as (typeof backgrounds)[T] extends string
      ? () => (typeof backgrounds)[T]
      : (variant: keyof (typeof backgrounds)[T]) => string;
  }

  return ((variant: keyof typeof backgroundGroup) => {
    return (backgroundGroup as Record<string, string>)[variant as string];
  }) as (typeof backgrounds)[T] extends string
    ? () => (typeof backgrounds)[T]
    : (variant: keyof (typeof backgrounds)[T]) => string;
}

// Commonly used combinations
export const commonBackgrounds = {
  // Main page layout
  page: backgrounds.main.fullscreen,
  // Dashboard page
  dashboard: backgrounds.main.simple,
  // Card component
  flashcard: backgrounds.card.flashcard,
  // Modal overlay
  modalOverlay: backgrounds.card.overlay,
  // Primary action button
  primaryButton: `${backgrounds.button.primaryTranslucent} ${backgrounds.button.primaryTranslucentHover}`,
} as const;

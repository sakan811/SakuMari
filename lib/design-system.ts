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

// Color palette
export const colors = {
  primary: "#d1622b",
  primaryDark: "#ae0d13",
  secondary: "#705a39",
  secondaryDark: "#403933",
  accent: "#fad182",
  accentLight: "#f5c55a",
  white: "#ffffff",

  // Semantic colors
  success: {
    600: "#059669",
    700: "#047857",
    100: "#d1fae5",
  },
  error: {
    100: "#fee2e2",
    300: "#fca5a5",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
  },
} as const;

// Common gradient backgrounds
export const gradients = {
  main: `bg-gradient-to-br from-[${colors.accent}] to-[${colors.accentLight}]`,
  primary: `bg-gradient-to-br from-[${colors.primary}] to-[${colors.primaryDark}]`,
  secondary: `bg-gradient-to-br from-[${colors.secondary}] to-[${colors.secondaryDark}]`,
  accent: `bg-gradient-to-br from-[${colors.accent}]/10 to-[${colors.accentLight}]/10`,
} as const;

// Button style variants
export const buttonStyles = {
  base: "rounded-lg font-medium transition-all duration-200 border-2",

  sizes: {
    sm: "px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm",
    md: "px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base",
    lg: "px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg",
  },

  variants: {
    primary: `bg-[${colors.primary}] text-white border-[${colors.primary}] hover:bg-[${colors.primaryDark}] hover:border-[${colors.primaryDark}] shadow-lg hover:shadow-xl transform hover:scale-105`,

    primaryGradient: `bg-gradient-to-br from-[${colors.primary}]/80 to-[${colors.primaryDark}]/80 hover:from-[${colors.primary}] hover:to-[${colors.primaryDark}] text-white border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm`,

    secondary: `bg-[${colors.secondary}] text-white border-[${colors.secondary}] hover:bg-[${colors.secondaryDark}] hover:border-[${colors.secondaryDark}] shadow-lg hover:shadow-xl transform hover:scale-105`,

    filter: {
      active: `bg-[${colors.primary}] text-white border-[${colors.primary}] shadow-lg`,
      inactive: `bg-white text-[${colors.secondary}] border-[${colors.secondary}] hover:bg-[${colors.accent}] hover:border-[${colors.primary}]`,
    },

    error: `bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700`,
  },
} as const;

// Common text styles
export const textStyles = {
  heading: {
    primary: `text-[${colors.secondaryDark}]`,
    secondary: `text-[${colors.secondary}]`,
  },
  body: `text-[${colors.secondary}]`,
  bodyDark: `text-[${colors.secondaryDark}]`,
  accent: `text-[${colors.accent}]`,
} as const;

// Card styles
export const cardStyles = {
  base: "rounded-lg shadow-xl backdrop-blur-sm",
  background: `bg-white/90 border-2 border-[${colors.secondary}]`,
  padding: "p-4 sm:p-6",
} as const;

// Table styles
export const tableStyles = {
  headerCell: `pb-2 sm:pb-3 pt-2 text-xs sm:text-sm font-semibold text-[${colors.secondaryDark}] cursor-pointer hover:text-[${colors.primary}] select-none transition-colors duration-200 px-1 sm:px-0`,

  row: {
    base: `border-b border-[${colors.secondary}]/30 hover:bg-[${colors.accent}]/40 transition-colors duration-200`,
    even: "bg-white/50",
    odd: `bg-[${colors.accent}]/20`,
  },

  cell: "py-2 sm:py-3 px-1 sm:px-0",
} as const;

// Utility functions
export const utils = {
  /**
   * Calculate accuracy percentage with proper formatting
   */
  formatAccuracy: (accuracy: number): string => {
    return `${(accuracy * 100).toFixed(1)}%`;
  },

  /**
   * Format accuracy for display (no decimal places)
   */
  formatAccuracySimple: (accuracy: number): string => {
    return `${(accuracy * 100).toFixed(0)}%`;
  },

  /**
   * Calculate average accuracy from an array of items
   */
  calculateAverageAccuracy: (items: { accuracy: number }[]): number => {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.accuracy, 0) / items.length;
  },

  /**
   * Combine className strings safely
   */
  cn: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(" ");
  },

  /**
   * Create loading spinner classes
   */
  createSpinnerClass: (size: "sm" | "md" | "lg" = "md"): string => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8 sm:h-12 sm:w-12",
      lg: "h-12 w-12 sm:h-16 sm:w-16",
    };
    return utils.cn(
      sizeClasses[size],
      "animate-spin rounded-full border-2 sm:border-4",
      `border-[${colors.primary}] border-t-transparent`
    );
  },
} as const;

// Component helper functions
export const createButtonClass = (
  variant: keyof typeof buttonStyles.variants,
  size: keyof typeof buttonStyles.sizes = "md",
): string => {
  const variantClass =
    typeof buttonStyles.variants[variant] === "object"
      ? "" // Handle complex variants separately
      : (buttonStyles.variants[variant] as string);

  return utils.cn(buttonStyles.base, buttonStyles.sizes[size], variantClass);
};

export const createFilterButtonClass = (
  isActive: boolean,
  size: keyof typeof buttonStyles.sizes = "sm",
): string => {
  return utils.cn(
    buttonStyles.base,
    buttonStyles.sizes[size],
    isActive
      ? buttonStyles.variants.filter.active
      : buttonStyles.variants.filter.inactive,
  );
};


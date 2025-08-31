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

import { ButtonHTMLAttributes, forwardRef, ReactNode, cloneElement, isValidElement } from "react";

// Utility function for className merging
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "brown" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "responsive";
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
  href?: string;
  animation?: "none" | "scale" | "shadow";
}

const buttonVariants = {
  primary: {
    base: "bg-[#d1622b] text-[#fad182] hover:text-white hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13]",
    disabled:
      "disabled:bg-[#705a39] disabled:border-[#705a39] disabled:cursor-not-allowed disabled:opacity-50",
  },
  secondary: {
    base: "bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300",
    disabled:
      "disabled:bg-gray-50 disabled:border-gray-100 disabled:cursor-not-allowed disabled:opacity-50",
  },
  brown: {
    base: "bg-[#705a39] text-white hover:bg-[#403933] border-2 border-[#705a39] hover:border-[#403933]",
    disabled:
      "disabled:bg-[#403933] disabled:border-[#403933] disabled:cursor-not-allowed disabled:opacity-50",
  },
  outline: {
    base: "bg-transparent text-[#d1622b] border-2 border-[#d1622b] hover:bg-[#d1622b] hover:text-[#fad182]",
    disabled:
      "disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50",
  },
  ghost: {
    base: "bg-transparent text-[#d1622b] hover:bg-[#d1622b]/10 border-2 border-transparent",
    disabled:
      "disabled:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50",
  },
};

const buttonSizes = {
  sm: "px-3 py-2 text-sm font-medium min-h-[36px]",
  md: "px-4 py-3 text-sm xl:text-base font-medium min-h-[44px]",
  lg: "px-6 py-4 text-base font-medium min-h-[48px]",
  responsive: "px-3 sm:px-4 py-2 text-sm sm:text-base font-medium min-h-[44px]",
};

const buttonAnimations = {
  none: "",
  scale: "transform hover:scale-105",
  shadow: "shadow-lg hover:shadow-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      animation = "shadow",
      disabled,
      href,
      asChild,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const variantStyles = buttonVariants[variant];

    const buttonClasses = cn(
      // Base button styles
      "inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium relative z-10",
      // Variant styles
      variantStyles.base,
      variantStyles.disabled,
      // Size styles
      buttonSizes[size],
      // Animation styles
      buttonAnimations[animation],
      // Width
      fullWidth && "w-full",
      // Loading cursor
      loading && "cursor-not-allowed",
      className,
    );

    // If href is provided, render as link (would need Link component)
    if (href && !asChild) {
      throw new Error("Link functionality requires Link component import");
    }

    // Handle asChild pattern - render the child element with button styling
    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ...(children.props as any),
        className: cn(buttonClasses, (children.props as any)?.className),
        ref,
        ...props
      });
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {loading && <span className="mr-2 animate-spin">⌛</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

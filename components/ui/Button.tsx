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

import {
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";

// Base button styles constant
const BASE_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium relative z-10";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "responsive";
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
  animation?: "none" | "scale" | "shadow";
}

const buttonVariants = {
  primary: {
    base: "bg-[#d1622b] text-[#fad182] hover:text-white hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13]",
    disabled:
      "disabled:bg-[#705a39] disabled:border-[#705a39] disabled:cursor-not-allowed disabled:opacity-50",
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
      asChild,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const variantStyles = buttonVariants[variant];

    // Build button classes with constants and conditionals
    const buttonClasses = [
      BASE_BUTTON_CLASSES,
      variantStyles.base,
      variantStyles.disabled,
      buttonSizes[size],
      buttonAnimations[animation],
      fullWidth && "w-full",
      loading && "cursor-not-allowed",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Handle asChild pattern - render the child element with button styling
    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ...(children.props as any),
        className: [
          buttonClasses,
          (children.props as { className?: string }).className,
        ]
          .filter(Boolean)
          .join(" "),
        ref,
        ...props,
      } as any);
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

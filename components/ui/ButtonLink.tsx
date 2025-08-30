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

import { forwardRef, ReactNode, AnchorHTMLAttributes } from "react";
import Link from "next/link";

// Utility function for className merging
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "brown" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "responsive";
  fullWidth?: boolean;
  animation?: "none" | "scale" | "shadow";
  external?: boolean;
}

const buttonVariants = {
  primary: {
    base: "bg-[#d1622b] text-[#fad182] hover:text-white hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13]",
  },
  secondary: {
    base: "bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300",
  },
  brown: {
    base: "bg-[#705a39] text-white hover:bg-[#403933] border-2 border-[#705a39] hover:border-[#403933]",
  },
  outline: {
    base: "bg-transparent text-[#d1622b] border-2 border-[#d1622b] hover:bg-[#d1622b] hover:text-[#fad182]",
  },
  ghost: {
    base: "bg-transparent text-[#d1622b] hover:bg-[#d1622b]/10 border-2 border-transparent",
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

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({
    children,
    href,
    className,
    variant = "primary",
    size = "md",
    fullWidth = false,
    animation = "shadow",
    external = false,
    ...props
  }, ref) => {
    const variantStyles = buttonVariants[variant];
    
    const linkClasses = cn(
      // Base button styles
      "inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium relative z-10",
      // Variant styles
      variantStyles.base,
      // Size styles
      buttonSizes[size],
      // Animation styles
      buttonAnimations[animation],
      // Width
      fullWidth && "w-full",
      // Text alignment for full width
      fullWidth && "text-center",
      className
    );

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        ref={ref}
        className={linkClasses}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

ButtonLink.displayName = "ButtonLink";
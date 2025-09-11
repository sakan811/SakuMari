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

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { DesktopNavigation } from "@/components/DesktopNavigation";

// Use vi.hoisted to declare mock functions that can be used in vi.mock
const { mockSignIn, mockSignOut } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignOut: vi.fn(),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

// Mock next/link with proper className forwarding
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} data-testid="mock-image" />
  ),
}));

describe("DesktopNavigation", () => {
  let defaultProps: {
    session: {
      user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
    } | null;
    status: "loading" | "authenticated" | "unauthenticated";
    credentialsEnabled: boolean;
  };
  let mockSession: NonNullable<typeof defaultProps["session"]>;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();

    defaultProps = {
      session: null,
      status: "unauthenticated",
      credentialsEnabled: false,
    };

    mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe("Authenticated User State", () => {
    test("renders navigation links for authenticated user", () => {
      render(
        <DesktopNavigation
          {...defaultProps}
          session={mockSession}
          status="authenticated"
        />,
      );

      // Check for Hiragana link
      const hiraganaLink = screen.getByRole("link", {
        name: /ひらがな Hiragana/,
      });
      expect(hiraganaLink).toBeInTheDocument();
      expect(hiraganaLink.getAttribute("href")).toBe("/hiragana");

      // Check for Katakana link
      const katakanaLink = screen.getByRole("link", {
        name: /カタカナ Katakana/,
      });
      expect(katakanaLink).toBeInTheDocument();
      expect(katakanaLink.getAttribute("href")).toBe("/katakana");

      // Check for Dashboard link
      const dashboardLink = screen.getByRole("link", { name: /📊 Dashboard/ });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.getAttribute("href")).toBe("/dashboard");
    });

    test("displays user profile with image when available", () => {
      render(
        <DesktopNavigation
          {...defaultProps}
          session={mockSession}
          status="authenticated"
        />,
      );

      const avatar = screen.getByAltText("Profile");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
      expect(avatar).toHaveClass(
        "w-6",
        "h-6",
        "xl:w-8",
        "xl:h-8",
        "rounded-full",
        "border-2",
        "border-[#fad182]",
      );

      // Check for Sign Out button instead of user name
      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      expect(signOutButton).toBeInTheDocument();
    });

    test("displays user initials when image is not available", () => {
      const testSession = {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      };

      render(
        <DesktopNavigation
          {...defaultProps}
          session={testSession}
          status="authenticated"
        />,
      );

      // Should show first letter of name as initial
      expect(screen.getByText("J")).toBeInTheDocument();
      expect(screen.queryByAltText("Profile")).not.toBeInTheDocument();

      // Check for Sign Out button instead of user name
      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      expect(signOutButton).toBeInTheDocument();
    });

    test("displays 'U' as fallback when name is not available", () => {
      const testSession = {
        user: {
          name: null,
          email: "john@example.com",
          image: null,
        },
      };

      render(
        <DesktopNavigation
          {...defaultProps}
          session={testSession}
          status="authenticated"
        />,
      );

      // Should show 'U' as fallback initial
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    test("renders sign out button and handles click", () => {
      render(
        <DesktopNavigation
          {...defaultProps}
          session={mockSession}
          status="authenticated"
        />,
      );

      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      expect(signOutButton).toBeInTheDocument();
      expect(signOutButton).toHaveClass("text-[#fad182]", "hover:bg-white/10");

      // Click sign out button
      fireEvent.click(signOutButton);
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("Unauthenticated State", () => {
    test("renders Google sign-in button when credentials not enabled", () => {
      render(<DesktopNavigation {...defaultProps} />);

      const googleButton = screen.getByRole("button", { name: "Sign In" });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toHaveClass(
        "bg-[#d1622b]",
        "hover:bg-[#ae0d13]",
        "text-[#fad182]",
      );

      // Click sign in button
      fireEvent.click(googleButton);
      expect(mockSignIn).toHaveBeenCalledWith("google");
    });

    test("disables button during loading state", () => {
      render(
        <DesktopNavigation {...defaultProps} status="loading" />,
      );

      const button = screen.getByRole("button", { name: "⌛ Sign In" });
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50");
    });
  });

  describe("Credentials Enabled State", () => {
    test("renders credentials sign-in button when credentials enabled", () => {
      // This test covers lines 99-102 in DesktopNavigation.tsx
      render(
        <DesktopNavigation {...defaultProps} credentialsEnabled={true} />,
      );

      const credentialsButton = screen.getByRole("button", { name: "Sign In" });
      expect(credentialsButton).toBeInTheDocument();
      expect(credentialsButton).toHaveClass(
        "bg-[#d1622b]",
        "hover:bg-[#ae0d13]",
        "text-[#fad182]",
      );

      // Click sign in button
      fireEvent.click(credentialsButton);
      expect(mockSignIn).toHaveBeenCalledWith("credentials");
    });

    test("disables credentials button during loading state", () => {
      render(
        <DesktopNavigation
          {...defaultProps}
          credentialsEnabled={true}
          status="loading"
        />,
      );

      const button = screen.getByRole("button", { name: "⌛ Sign In" });
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50");
    });

    test("shows loading state when status is loading", () => {
      render(
        <DesktopNavigation
          {...defaultProps}
          credentialsEnabled={true}
          status="loading"
        />,
      );

      const button = screen.getByRole("button", { name: "⌛ Sign In" });
      // Verify the loading spinner is present
      expect(button.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles null session gracefully", () => {
      render(<DesktopNavigation {...defaultProps} session={null} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Sign In" }),
      ).toBeInTheDocument();
    });

    test("handles undefined user in session", () => {
      const testSession = {
        user: undefined,
      };

      render(
        <DesktopNavigation
          {...defaultProps}
          session={testSession}
          status="authenticated"
        />,
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      // When session exists but user is undefined, it still renders authenticated state
      expect(
        screen.getByRole("link", { name: /ひらがな Hiragana/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Sign Out" }),
      ).toBeInTheDocument();
    });
  });
});
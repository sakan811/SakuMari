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

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MobileNavigation } from "@/components/MobileNavigation";

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

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    _src,
    alt,
    width,
    height,
    className,
    _unoptimized,
    _referrerPolicy,
  }: {
    _src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    _unoptimized?: boolean;
    _referrerPolicy?: string;
  }) => (
    <div
      data-testid="mock-image"
      style={{ width, height }}
      className={className}
      role="img"
      aria-label={alt}
    />
  ),
}));

describe("MobileNavigation", () => {
  const mockSetMobileMenuOpen = vi.fn();
  
  const defaultProps = {
    session: null,
    status: "unauthenticated" as const,
    credentialsEnabled: false,
    mobileMenuOpen: true,
    setMobileMenuOpen: mockSetMobileMenuOpen,
  };

  const mockSession = {
    user: {
      id: "user123",
      name: "John Doe",
      email: "john@example.com",
      image: "https://example.com/avatar.jpg",
    },
    expires: "2025-12-31T23:59:59.999Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Menu Visibility", () => {
    test("returns null when mobileMenuOpen is false", () => {
      const { container } = render(
        <MobileNavigation {...defaultProps} mobileMenuOpen={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    test("renders navigation when mobileMenuOpen is true", () => {
      render(<MobileNavigation {...defaultProps} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toHaveClass("lg:hidden");
    });
  });

  describe("Authenticated User State (lines 56-112)", () => {
    const authenticatedProps = {
      ...defaultProps,
      session: mockSession,
      status: "authenticated" as const,
    };

    test("renders navigation links for authenticated user", () => {
      render(<MobileNavigation {...authenticatedProps} />);

      // Check for Hiragana link
      const hiraganaLink = screen.getByRole("link", { name: /ひらがな Hiragana/ });
      expect(hiraganaLink).toBeInTheDocument();
      expect(hiraganaLink.getAttribute("href")).toBe("/hiragana");

      // Check for Katakana link
      const katakanaLink = screen.getByRole("link", { name: /カタカナ Katakana/ });
      expect(katakanaLink).toBeInTheDocument();
      expect(katakanaLink.getAttribute("href")).toBe("/katakana");

      // Check for Dashboard link
      const dashboardLink = screen.getByRole("link", { name: /📊 Dashboard/ });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.getAttribute("href")).toBe("/dashboard");
    });

    test("closes mobile menu when navigation links are clicked", () => {
      render(<MobileNavigation {...authenticatedProps} />);

      // Click Hiragana link
      fireEvent.click(screen.getByRole("link", { name: /ひらがな Hiragana/ }));
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);

      // Click Katakana link
      fireEvent.click(screen.getByRole("link", { name: /カタカナ Katakana/ }));
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);

      // Click Dashboard link
      fireEvent.click(screen.getByRole("link", { name: /📊 Dashboard/ }));
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("displays user profile with image when available", () => {
      render(<MobileNavigation {...authenticatedProps} />);

      const avatar = screen.getByAltText("Profile");
      expect(avatar).toBeInTheDocument();
      expect(avatar.getAttribute("src")).toBe("https://example.com/avatar.jpg");
      expect(avatar).toHaveClass("w-6", "h-6", "sm:w-8", "sm:h-8", "rounded-full", "border-2", "border-[#fad182]");

      // Check user name display
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    test("displays user initials when image is not available", () => {
      const sessionWithoutImage = {
        ...mockSession,
        user: { ...mockSession.user, image: null },
      };

      render(
        <MobileNavigation
          {...authenticatedProps}
          session={sessionWithoutImage}
        />
      );

      // Should show first letter of name as initial
      expect(screen.getByText("J")).toBeInTheDocument();
      expect(screen.queryByAltText("Profile")).not.toBeInTheDocument();

      // Check user name still displayed
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    test("displays 'U' as fallback when name is not available", () => {
      const sessionWithoutName = {
        ...mockSession,
        user: { ...mockSession.user, name: null, image: null },
      };

      render(
        <MobileNavigation
          {...authenticatedProps}
          session={sessionWithoutName}
        />
      );

      // Should show 'U' as fallback initial
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    test("handles empty name string", () => {
      const sessionWithEmptyName = {
        ...mockSession,
        user: { ...mockSession.user, name: "", image: null },
      };

      render(
        <MobileNavigation
          {...authenticatedProps}
          session={sessionWithEmptyName}
        />
      );

      // Should show 'U' as fallback initial for empty string
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    test("renders sign out button and handles click", () => {
      render(<MobileNavigation {...authenticatedProps} />);

      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      expect(signOutButton).toBeInTheDocument();
      expect(signOutButton).toHaveClass("text-[#fad182]", "hover:text-white");

      // Click sign out button
      fireEvent.click(signOutButton);
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("applies correct CSS classes to authenticated elements", () => {
      render(<MobileNavigation {...authenticatedProps} />);

      const navigation = screen.getByRole("navigation");
      expect(navigation).toHaveClass(
        "lg:hidden",
        "mt-3",
        "sm:mt-4",
        "pt-3",
        "sm:pt-4",
        "border-t",
        "border-[#fad182]/30"
      );

      // Check dashboard link has special styling
      const dashboardLink = screen.getByRole("link", { name: /📊 Dashboard/ });
      expect(dashboardLink).toHaveClass(
        "bg-[#d1622b]",
        "hover:bg-[#ae0d13]",
        "border-[#d1622b]",
        "hover:border-[#ae0d13]"
      );
    });
  });

  describe("Credentials Enabled State (lines 115-173)", () => {
    const credentialsEnabledProps = {
      ...defaultProps,
      credentialsEnabled: true,
    };

    test("renders Google sign-in button when credentials enabled", () => {
      render(<MobileNavigation {...credentialsEnabledProps} />);

      const googleButton = screen.getByRole("button", { name: /Sign In with Google/ });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toHaveClass("bg-[#4285f4]", "hover:bg-[#3367d6]");
      
      // Check for Google icon (SVG)
      const googleIcon = googleButton.querySelector("svg");
      expect(googleIcon).toBeInTheDocument();
      expect(googleIcon).toHaveClass("w-5", "h-5");
    });

    test("renders credentials sign-in button when credentials enabled", () => {
      render(<MobileNavigation {...credentialsEnabledProps} />);

      const credentialsButton = screen.getByRole("button", { name: /Sign In with Credentials/ });
      expect(credentialsButton).toBeInTheDocument();
      expect(credentialsButton).toHaveClass(
        "bg-[#403933]",
        "hover:bg-[#705a39]",
        "text-[#fad182]",
        "border-2",
        "border-[#d1622b]"
      );

      // Check for user icon (SVG)
      const userIcon = credentialsButton.querySelector("svg");
      expect(userIcon).toBeInTheDocument();
      expect(userIcon).toHaveClass("w-5", "h-5");
    });

    test("renders separator between sign-in options", () => {
      render(<MobileNavigation {...credentialsEnabledProps} />);

      expect(screen.getByText("or")).toBeInTheDocument();
      
      // Check separator styling
      const separator = screen.getByText("or").parentElement;
      expect(separator).toHaveClass("flex", "items-center", "gap-2");
    });

    test("handles Google sign-in button click", () => {
      render(<MobileNavigation {...credentialsEnabledProps} />);

      const googleButton = screen.getByRole("button", { name: /Sign In with Google/ });
      fireEvent.click(googleButton);

      // Test lines 47-48: handleSignIn function
      expect(mockSignIn).toHaveBeenCalledWith("google");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("handles credentials sign-in button click", () => {
      render(<MobileNavigation {...credentialsEnabledProps} />);

      const credentialsButton = screen.getByRole("button", { name: /Sign In with Credentials/ });
      fireEvent.click(credentialsButton);

      // Test lines 47-48: handleSignIn function with different provider
      expect(mockSignIn).toHaveBeenCalledWith("credentials");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("disables buttons during loading state", () => {
      render(
        <MobileNavigation
          {...credentialsEnabledProps}
          status="loading"
        />
      );

      const buttons = screen.getAllByRole("button", { name: /Loading.../ });
      expect(buttons).toHaveLength(2);

      // Both buttons should be disabled
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
        expect(button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
      });

      // First button should be Google (blue background)
      expect(buttons[0]).toHaveClass("bg-[#4285f4]");
      // Second button should be credentials (darker background)
      expect(buttons[1]).toHaveClass("bg-[#403933]");
    });

    test("shows 'Loading...' text during loading state", () => {
      render(
        <MobileNavigation
          {...credentialsEnabledProps}
          status="loading"
        />
      );

      // Should have two "Loading..." buttons
      const loadingButtons = screen.getAllByText("Loading...");
      expect(loadingButtons).toHaveLength(2);
    });

    test("buttons are not disabled when status is not loading", () => {
      render(<MobileNavigation {...credentialsEnabledProps} />);

      const googleButton = screen.getByRole("button", { name: /Sign In with Google/ });
      const credentialsButton = screen.getByRole("button", { name: /Sign In with Credentials/ });

      expect(googleButton).not.toBeDisabled();
      expect(credentialsButton).not.toBeDisabled();
    });
  });

  describe("Default State - Google Only (lines 176-189)", () => {
    test("renders only Google sign-in button when credentials disabled", () => {
      render(<MobileNavigation {...defaultProps} />);

      const googleButton = screen.getByRole("button", { name: /Sign In with Google/ });
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toHaveClass(
        "text-[#fad182]",
        "hover:text-white",
        "bg-[#d1622b]",
        "hover:bg-[#ae0d13]",
        "border-2",
        "border-[#d1622b]",
        "hover:border-[#ae0d13]"
      );

      // Should not render credentials button or separator
      expect(screen.queryByRole("button", { name: /Sign In with Credentials/ })).not.toBeInTheDocument();
      expect(screen.queryByText("or")).not.toBeInTheDocument();
    });

    test("handles Google sign-in button click in default state", () => {
      render(<MobileNavigation {...defaultProps} />);

      const googleButton = screen.getByRole("button", { name: /Sign In with Google/ });
      fireEvent.click(googleButton);

      expect(mockSignIn).toHaveBeenCalledWith("google");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("disables Google button during loading in default state", () => {
      render(
        <MobileNavigation
          {...defaultProps}
          status="loading"
        />
      );

      const button = screen.getByRole("button", { name: /Loading.../ });
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
    });

    test("shows 'Loading...' text during loading in default state", () => {
      render(
        <MobileNavigation
          {...defaultProps}
          status="loading"
        />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("Sign In with Google")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases and Prop Variations", () => {
    test("handles null session gracefully", () => {
      render(<MobileNavigation {...defaultProps} session={null} />);
      
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Sign In with Google/ })).toBeInTheDocument();
    });

    test("handles undefined user in session", () => {
      const sessionWithUndefinedUser = {
        user: undefined,
        expires: "2025-12-31T23:59:59.999Z",
      };

      render(
        <MobileNavigation
          {...defaultProps}
          session={sessionWithUndefinedUser}
          status="authenticated"
        />
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      // When session exists but user is undefined, it still renders authenticated state
      expect(screen.getByRole("link", { name: /ひらがな Hiragana/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
      // Should show fallback initial 'U' for undefined user
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    test("handles all loading states correctly", () => {
      const states = ["loading", "authenticated", "unauthenticated"] as const;
      
      states.forEach((status) => {
        vi.clearAllMocks();
        const { rerender } = render(
          <MobileNavigation {...defaultProps} status={status} />
        );

        if (status === "loading") {
          expect(screen.getByText("Loading...")).toBeInTheDocument();
          const buttons = screen.getAllByRole("button");
          expect(buttons[0]).toBeDisabled();
        } else {
          expect(screen.getByText("Sign In with Google")).toBeInTheDocument();
          const buttons = screen.getAllByRole("button");
          expect(buttons[0]).not.toBeDisabled();
        }

        // Clean up for next iteration
        rerender(<div></div>);
      });
    });

    test("maintains accessibility attributes", () => {
      render(<MobileNavigation {...defaultProps} />);

      const navigation = screen.getByRole("navigation");
      expect(navigation).toBeInTheDocument();

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveClass("cursor-pointer");
    });

    test("handles rapid state changes", () => {
      const { rerender } = render(<MobileNavigation {...defaultProps} />);

      // Simulate rapid state changes
      rerender(<MobileNavigation {...defaultProps} status="loading" />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      rerender(<MobileNavigation {...defaultProps} status="authenticated" session={mockSession} />);
      expect(screen.getByRole("link", { name: /ひらがな Hiragana/ })).toBeInTheDocument();

      rerender(<MobileNavigation {...defaultProps} credentialsEnabled={true} />);
      expect(screen.getByRole("button", { name: /Sign In with Credentials/ })).toBeInTheDocument();
    });

    test("preserves button functionality across re-renders", () => {
      const { rerender } = render(
        <MobileNavigation {...defaultProps} credentialsEnabled={true} />
      );

      // Click before re-render
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Google/ }));
      expect(mockSignIn).toHaveBeenCalledWith("google");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);

      // Re-render with different props
      rerender(
        <MobileNavigation
          {...defaultProps}
          credentialsEnabled={true}
          status="loading"
        />
      );

      // Buttons should be disabled during loading
      const buttons = screen.getAllByRole("button");
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("CSS Classes and Styling", () => {
    test("applies consistent navigation classes across all states", () => {
      const testCases = [
        { props: { ...defaultProps }, description: "default" },
        { props: { ...defaultProps, credentialsEnabled: true }, description: "credentials enabled" },
        { props: { ...defaultProps, session: mockSession, status: "authenticated" as const }, description: "authenticated" },
      ];

      testCases.forEach(({ props, description }) => {
        const { rerender } = render(<MobileNavigation {...props} />);
        
        const navigation = screen.getByRole("navigation");
        expect(navigation, `Failed for ${description} state`).toHaveClass(
          "lg:hidden",
          "mt-3",
          "sm:mt-4",
          "pt-3",
          "sm:pt-4",
          "border-t",
          "border-[#fad182]/30"
        );

        // Clean up for next test
        rerender(<div></div>);
      });
    });

    test("applies responsive classes correctly", () => {
      render(<MobileNavigation {...defaultProps} session={mockSession} status="authenticated" />);

      // Check responsive classes on various elements
      const profileImage = screen.getByAltText("Profile");
      expect(profileImage).toHaveClass("w-6", "h-6", "sm:w-8", "sm:h-8");

      const userName = screen.getByText("John Doe");
      expect(userName).toHaveClass("text-sm", "sm:text-base");

      const navigation = screen.getByRole("navigation");
      const container = navigation.querySelector(".flex.flex-col.space-y-2");
      expect(container).toHaveClass("space-y-2", "sm:space-y-3");
    });
  });
});
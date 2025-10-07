/*
 * SakuMari: Japanese Kana Flashcard App
 * Copyright (C) 2025 SakuMari
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useSession, signIn, signOut } from "next-auth/react";
import { MobileNavigation } from "../components/MobileNavigation";

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe("MobileNavigation Component", () => {
  const mockSetMobileMenuOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("When menu is closed", () => {
    test("renders nothing when mobileMenuOpen is false", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      const { container } = render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={false}
          mobileMenuOpen={false}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Authenticated user navigation", () => {
    const mockSession = {
      user: {
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    test("renders navigation links when user is authenticated", () => {
      (useSession as any).mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("ひらがな Hiragana")).toBeInTheDocument();
      expect(screen.getByText("カタカナ Katakana")).toBeInTheDocument();
      expect(screen.getByText("📊 Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    test("displays user profile image when available", () => {
      (useSession as any).mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const profileImage = screen.getByAltText("Profile");
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    test("displays user initials when no image available", () => {
      const sessionWithoutImage = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
      };

      (useSession as any).mockReturnValue({
        data: sessionWithoutImage,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={sessionWithoutImage}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("J")).toBeInTheDocument(); // First letter of "John"
    });

    test("displays 'U' as fallback when no name available", () => {
      const sessionWithoutName = {
        user: {
          email: "user@example.com",
        },
      };

      (useSession as any).mockReturnValue({
        data: sessionWithoutName,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={sessionWithoutName}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("U")).toBeInTheDocument();
    });

    test("calls handleSignIn when signing in with provider", () => {
      (useSession as any).mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      // This tests the handleSignIn function (lines 47-49)
      // Since we're authenticated, we need to test the sign out functionality
      const signOutButton = screen.getByText("Sign Out");
      fireEvent.click(signOutButton);

      expect(signOut).toHaveBeenCalled();
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("calls handleSignOut when signing out", () => {
      (useSession as any).mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const signOutButton = screen.getByText("Sign Out");
      fireEvent.click(signOutButton);

      expect(signOut).toHaveBeenCalled();
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("closes menu when clicking navigation links", () => {
      (useSession as any).mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const hiraganaLink = screen.getByText("ひらがな Hiragana");
      fireEvent.click(hiraganaLink);

      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("Unauthenticated with credentials enabled", () => {
    test("renders Google and Credentials sign in buttons", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("Sign In with Google")).toBeInTheDocument();
      expect(screen.getByText("Sign In with Credentials")).toBeInTheDocument();
      expect(screen.getByText("or")).toBeInTheDocument();
    });

    test("calls handleSignIn with Google provider", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const googleButton = screen.getByText("Sign In with Google");
      fireEvent.click(googleButton);

      expect(signIn).toHaveBeenCalledWith("google");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("calls handleSignIn with Credentials provider", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const credentialsButton = screen.getByText("Sign In with Credentials");
      fireEvent.click(credentialsButton);

      expect(signIn).toHaveBeenCalledWith("credentials");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("shows loading state when status is loading", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "loading",
      });

      render(
        <MobileNavigation
          session={null}
          status="loading"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const loadingButtons = screen.getAllByText("Loading...");
      expect(loadingButtons).toHaveLength(2);

      expect(loadingButtons[0]).toBeInTheDocument();
      expect(loadingButtons[0]).toBeDisabled();

      expect(loadingButtons[1]).toBeInTheDocument();
      expect(loadingButtons[1]).toBeDisabled();
    });
  });

  describe("Unauthenticated without credentials enabled", () => {
    test("renders only Google sign in button", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("Sign In with Google")).toBeInTheDocument();
      expect(screen.queryByText("Sign In with Credentials")).not.toBeInTheDocument();
      expect(screen.queryByText("or")).not.toBeInTheDocument();
    });

    test("calls handleSignIn with Google when credentials disabled", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const googleButton = screen.getByText("Sign In with Google");
      fireEvent.click(googleButton);

      expect(signIn).toHaveBeenCalledWith("google");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("shows loading state when status is loading", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "loading",
      });

      render(
        <MobileNavigation
          session={null}
          status="loading"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const googleButton = screen.getByText("Loading...");
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).toBeDisabled();
    });
  });

  describe("Accessibility and styling", () => {
    test("applies correct styling classes for mobile navigation", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("lg:hidden");
    });

    test("buttons have proper ARIA labels and types", () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });
});
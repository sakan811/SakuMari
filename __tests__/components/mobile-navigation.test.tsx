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

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileNavigation } from "../../components/MobileNavigation";

// Mock next-auth/react
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockUseSession = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signIn: (provider: string) => mockSignIn(provider),
  signOut: () => mockSignOut(),
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

  describe("Menu Visibility", () => {
    test("does not render when mobileMenuOpen is false", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      const { container } = render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={false}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test("renders navigation when mobileMenuOpen is true", () => {
      mockUseSession.mockReturnValue({
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
    });
  });

  describe("Authenticated User Navigation", () => {
    const mockSession = {
      user: {
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    test("renders navigation links for authenticated user", () => {
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

      mockUseSession.mockReturnValue({
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

      mockUseSession.mockReturnValue({
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

    test("calls signOut and closes menu when sign out button is clicked", () => {
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

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("closes menu when navigation links are clicked", () => {
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

  describe("Unauthenticated User with Credentials Enabled", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    test("renders Google and Credentials sign in buttons", () => {
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

    test("calls signIn with Google and closes menu", () => {
      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const googleSignInButton = screen.getByText("Sign In with Google");
      fireEvent.click(googleSignInButton);

      expect(mockSignIn).toHaveBeenCalledWith("google");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("calls signIn with credentials and closes menu", () => {
      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const credentialsSignInButton = screen.getByText("Sign In with Credentials");
      fireEvent.click(credentialsSignInButton);

      expect(mockSignIn).toHaveBeenCalledWith("credentials");
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("disables buttons when status is loading", () => {
      mockUseSession.mockReturnValue({
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
      loadingButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Unauthenticated User without Credentials", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    test("renders only Google sign in when credentials are disabled", () => {
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

    test("disables Google button when status is loading", () => {
      mockUseSession.mockReturnValue({
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
      expect(googleButton).toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    test("handles user with special characters in name", () => {
      const sessionWithSpecialName = {
        user: {
          name: "山田太郎",
          email: "test@example.com",
        },
      };

      mockUseSession.mockReturnValue({
        data: sessionWithSpecialName,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={sessionWithSpecialName}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("山")).toBeInTheDocument();
      expect(screen.getByText("山田太郎")).toBeInTheDocument();
    });

    test("handles user with empty name", () => {
      const sessionWithEmptyName = {
        user: {
          name: "",
          email: "test@example.com",
        },
      };

      mockUseSession.mockReturnValue({
        data: sessionWithEmptyName,
        status: "authenticated",
      });

      render(
        <MobileNavigation
          session={sessionWithEmptyName}
          status="authenticated"
          credentialsEnabled={false}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("U")).toBeInTheDocument();
    });
  });

  describe("Accessibility and Styling", () => {
    test("applies correct styling classes for mobile navigation", () => {
      mockUseSession.mockReturnValue({
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
      mockUseSession.mockReturnValue({
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

    test("navigation links have proper accessibility attributes", () => {
      const mockSession = {
        user: {
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockUseSession.mockReturnValue({
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

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);

      links.forEach(link => {
        expect(link).toHaveClass("min-h-[44px]");
      });
    });
  });
});
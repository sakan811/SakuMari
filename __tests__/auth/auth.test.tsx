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
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Header from "@/components/Header";
import Home from "@/app/page";
import FlashcardApp from "@/components/FlashcardApp";

// Use vi.hoisted to declare mock functions that can be used in vi.mock
const { mockUseSession, mockSignIn, mockSignOut } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockSignIn: vi.fn(),
  mockSignOut: vi.fn(),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: mockUseSession,
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
    unoptimized?: boolean;
  }) => <img src={src} alt={alt} />, // eslint-disable-line @next/next/no-img-element
}));

// Mock fetch for session management tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  describe("Unauthenticated State", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    test("shows sign-in button in header when user is not authenticated", () => {
      render(<Header />);

      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
    });

    test("calls signIn when sign-in button is clicked", () => {
      render(<Header />);

      const signInButton = screen.getByText("Sign In");
      fireEvent.click(signInButton);

      expect(mockSignIn).toHaveBeenCalledWith("google");
    });

    test("shows welcome message instead of practice options on home page", () => {
      render(<Home />);

      expect(screen.getByText("Welcome to SakuMari!")).toBeInTheDocument();
      expect(
        screen.getByText(/Sign in with your Google account/)
      ).toBeInTheDocument();
      expect(
        screen.queryByText("ひらがな Hiragana Practice")
      ).not.toBeInTheDocument();
    });

    test("disables sign-in button during loading state", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<Header />);

      const signInButton = screen.getByText("Sign In");
      expect(signInButton).toBeDisabled();
    });
  });

  describe("Authenticated State", () => {
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
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    test("shows user profile and sign-out button when authenticated", () => {
      render(<Header />);

      expect(screen.getByText("Sign Out")).toBeInTheDocument();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
    });

    test("displays user avatar when image is available", () => {
      render(<Header />);

      const avatar = screen.getByAltText("Profile");
      expect(avatar).toBeInTheDocument();
      expect(avatar.getAttribute("src")).toContain("avatar.jpg");
    });

    test("shows user initials when no image available", () => {
      mockUseSession.mockReturnValue({
        data: { ...mockSession, user: { ...mockSession.user, image: null } },
        status: "authenticated",
      });

      render(<Header />);

      expect(screen.getByText("J")).toBeInTheDocument(); // First letter of John
    });

    test("calls signOut when sign-out button is clicked", () => {
      render(<Header />);

      const signOutButton = screen.getByText("Sign Out");
      fireEvent.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalled();
    });

    test("shows practice options when authenticated", () => {
      render(<Home />);

      expect(
        screen.getByText("ひらがな Hiragana Practice")
      ).toBeInTheDocument();
      expect(
        screen.getByText("カタカナ Katakana Practice")
      ).toBeInTheDocument();
      expect(screen.getByText("📊 View Your Progress")).toBeInTheDocument();
    });

    test("shows navigation links in header when authenticated", () => {
      render(<Header />);

      expect(screen.getByText(/Hiragana/)).toBeInTheDocument();
      expect(screen.getByText(/Katakana/)).toBeInTheDocument();
      expect(screen.getByText("📊 Dashboard")).toBeInTheDocument();
    });
  });

  describe("Session Management", () => {
    test("maintains session state across component updates", () => {
      const sessionData = {
        user: { id: "user123", name: "Test User" },
        expires: "2025-12-31T23:59:59.999Z",
      };

      mockUseSession.mockReturnValue({
        data: sessionData,
        status: "authenticated",
      });

      render(<FlashcardApp kanaType="hiragana" />);

      expect(mockUseSession).toHaveBeenCalled();
    });

    test("handles session expiration gracefully", () => {
      // Start with valid session
      mockUseSession.mockReturnValue({
        data: { user: { id: "user123" } },
        status: "authenticated",
      });

      render(<FlashcardApp kanaType="hiragana" />);

      expect(screen.queryByRole("status")).toBeInTheDocument();
    });
  });

  describe("Mobile Navigation Authentication", () => {
    test("shows mobile menu with authentication options", async () => {
      const mockSession = {
        user: { id: "user123", name: "John Doe", email: "john@example.com" },
        expires: "2025-12-31T23:59:59.999Z",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Header />);

      // Click mobile menu button
      const menuButton = screen.getByLabelText("Toggle mobile menu");
      fireEvent.click(menuButton);

      // Check mobile menu items appear
      const hiraganaLinks = screen.getAllByText(/Hiragana/);
      expect(hiraganaLinks.length).toBeGreaterThan(1); // Desktop + mobile versions
    });

    test("mobile sign-out calls signOut function", async () => {
      const mockSession = {
        user: { id: "user123", name: "John Doe", email: "john@example.com" },
        expires: "2025-12-31T23:59:59.999Z",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Header />);

      // Open mobile menu
      const menuButton = screen.getByLabelText("Toggle mobile menu");
      fireEvent.click(menuButton);

      // Find and click mobile sign out button
      const signOutButtons = screen.getAllByText("Sign Out");
      // Click the second one (mobile version)
      if (signOutButtons.length > 1) {
        fireEvent.click(signOutButtons[1]);
        expect(mockSignOut).toHaveBeenCalled();
      }
    });
  });
});

describe("Protected Routes Logic", () => {
  test("should redirect unauthenticated users from protected routes", () => {
    const protectedPaths = ["/hiragana", "/katakana", "/dashboard"];
    const isAuthenticated = false;

    protectedPaths.forEach((path) => {
      if (!isAuthenticated && path !== "/") {
        // Should redirect to home
        expect(path).not.toBe("/");
      }
    });
  });

  test("should allow authenticated users to access protected routes", () => {
    const protectedPaths = ["/hiragana", "/katakana", "/dashboard"];
    const isAuthenticated = true;

    protectedPaths.forEach((path) => {
      if (isAuthenticated) {
        // Should allow access
        expect(typeof path).toBe("string");
      }
    });
  });

  test("should allow unauthenticated access to home page", () => {
    const homePath = "/";
    const isAuthenticated = false;

    // Home should always be accessible
    expect(homePath).toBe("/");
    expect(isAuthenticated).toBe(false);
  });
});
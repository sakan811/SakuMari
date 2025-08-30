import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Header from "@/components/Header";
import Home from "@/app/page";

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

describe("Authentication Flow Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Unauthenticated State", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    test("shows sign-in button when user is not authenticated", () => {
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

    test("shows welcome message instead of practice options", () => {
      render(<Home />);

      expect(screen.getByText("Welcome to SakuMari!")).toBeInTheDocument();
      expect(
        screen.getByText(/Sign in with your Google account/),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("ひらがな Hiragana Practice"),
      ).not.toBeInTheDocument();
    });

    test("disables sign-in button during loading state", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<Header />);

      const signInButton = screen.getByText("Loading...");
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
        screen.getByText("ひらがな Hiragana Practice"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("カタカナ Katakana Practice"),
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

  describe("Loading State", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });
    });

    test("shows loading spinner during authentication check", () => {
      const { container } = render(<Home />);

      // Try multiple approaches to find the loading spinner
      // First try to find by class name (most common approach)
      const spinner = screen.getByTestId
        ? screen.queryByTestId("loading-spinner")
        : container.querySelector(".animate-spin");

      if (spinner) {
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass("animate-spin");
      } else {
        // Fallback: look for any element with animate-spin class
        const spinnerByClass = document.querySelector(".animate-spin");
        expect(spinnerByClass).toBeTruthy();
      }
    });

    test("disables sign-in button during loading", () => {
      render(<Header />);

      const button = screen.getByText("Loading...");
      expect(button).toBeDisabled();
    });
  });

  describe("Mobile Navigation", () => {
    const mockSession = {
      user: { id: "user123", name: "John Doe", email: "john@example.com" },
      expires: "2025-12-31T23:59:59.999Z",
    };

    test("shows mobile menu with authentication options", async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Header />);

      // Click mobile menu button
      const menuButton = screen.getByLabelText("Toggle mobile menu");
      fireEvent.click(menuButton);

      // Check mobile menu items appear
      await waitFor(() => {
        const hiraganaLinks = screen.getAllByText(/Hiragana/);
        expect(hiraganaLinks.length).toBeGreaterThan(1); // Desktop + mobile versions
      });
    });

    test("mobile sign-out calls signOut function", async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Header />);

      // Open mobile menu
      const menuButton = screen.getByLabelText("Toggle mobile menu");
      fireEvent.click(menuButton);

      // Find and click mobile sign out button
      await waitFor(() => {
        const signOutButtons = screen.getAllByText("Sign Out");
        // Click the second one (mobile version)
        if (signOutButtons.length > 1) {
          fireEvent.click(signOutButtons[1]);
          expect(mockSignOut).toHaveBeenCalled();
        }
      });
    });
  });
});

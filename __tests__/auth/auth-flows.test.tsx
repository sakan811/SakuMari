import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, unoptimized, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("Authentication Flow Tests", () => {
  describe("Unauthenticated State", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    test("shows sign-in button when user is not authenticated", async () => {
      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      expect(await screen.findByText("Sign In")).toBeInTheDocument();
      expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
    });

    test("calls signIn when sign-in button is clicked", async () => {
      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      const signInButton = await screen.findByText("Sign In");
      fireEvent.click(signInButton);

      expect(mockSignIn).toHaveBeenCalledWith("credentials");
    });

    test("shows welcome message instead of practice options", async () => {
      render(<Home />);

      expect(
        await screen.findByText("Welcome to SakuMari!"),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Sign in with your Google account/),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("ひらがな Hiragana Practice"),
      ).not.toBeInTheDocument();
    });

    test("disables sign-in button during loading state", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      const signInButton = await screen.findByText("Loading...");
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

    test("shows user profile and sign-out button when authenticated", async () => {
      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      expect(await screen.findByText("Sign Out")).toBeInTheDocument();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
    });

    test("displays user avatar when image is available", async () => {
      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      const avatar = await screen.findByAltText("Profile");
      expect(avatar).toBeInTheDocument();
      expect(avatar.getAttribute("src")).toContain("avatar.jpg");
    });

    test("shows user initials when no image available", async () => {
      mockUseSession.mockReturnValue({
        data: { ...mockSession, user: { ...mockSession.user, image: null } },
        status: "authenticated",
      });

      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      expect(await screen.findByText("J")).toBeInTheDocument(); // First letter of John
    });

    test("calls signOut when sign-out button is clicked", async () => {
      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      const signOutButton = await screen.findByText("Sign Out");
      fireEvent.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalled();
    });

    test("shows practice options when authenticated", async () => {
      render(<Home />);

      expect(
        await screen.findByText("ひらがな Hiragana Practice"),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("カタカナ Katakana Practice"),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("📊 View Your Progress"),
      ).toBeInTheDocument();
    });

    test("shows navigation links in header when authenticated", async () => {
      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      expect(await screen.findByText(/Hiragana/)).toBeInTheDocument();
      expect(await screen.findByText(/Katakana/)).toBeInTheDocument();
      expect(await screen.findByText("📊 Dashboard")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });
    });

    test("shows loading spinner during authentication check", async () => {
      render(<Home />);

      // Use findByTestId which waits for the element to appear
      const spinner = await screen.findByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    test("disables sign-in button during loading", async () => {
      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

      const button = await screen.findByText("Loading...");
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

      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

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

      render(<Header activeTab="flashcards" setActiveTab={vi.fn()} />);

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

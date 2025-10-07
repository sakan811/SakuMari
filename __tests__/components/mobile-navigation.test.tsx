import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileNavigation } from "../../components/MobileNavigation";

// Mock next-auth/react
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: () => mockSignOut(),
  signIn: (provider: string) => mockSignIn(provider),
}));

describe("MobileNavigation Component", () => {
  const mockSetMobileMenuOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("When mobile menu is closed", () => {
    test("does not render navigation when mobileMenuOpen is false", () => {
      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={false}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      // Should not render any navigation content
      expect(screen.queryByText("ひらがな Hiragana")).toBeNull();
      expect(screen.queryByText("カタカナ Katakana")).toBeNull();
      expect(screen.queryByText("Sign In with Google")).toBeNull();
    });
  });

  describe("Authenticated user with session", () => {
    const mockSession = {
      user: {
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    test("renders navigation links for authenticated user", () => {
      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("ひらがな Hiragana")).toBeTruthy();
      expect(screen.getByText("カタカナ Katakana")).toBeTruthy();
      expect(screen.getByText("📊 Dashboard")).toBeTruthy();
      expect(screen.getByText("Test User")).toBeTruthy();
      expect(screen.getByText("Sign Out")).toBeTruthy();
    });

    test("displays user profile image when available", () => {
      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      // Profile image should be present (checking alt attribute)
      expect(screen.getByAltText("Profile")).toBeTruthy();
    });

    test("displays user avatar fallback when no image", () => {
      const sessionWithoutImage = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
      };

      render(
        <MobileNavigation
          session={sessionWithoutImage}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      // Should show fallback avatar with first letter of name
      expect(screen.getByText("J")).toBeTruthy();
    });

    test("calls signOut and closes menu when sign out button is clicked", async () => {
      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const signOutButton = screen.getByText("Sign Out");

      fireEvent.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });

    test("closes menu when navigation links are clicked", async () => {
      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const hiraganaLink = screen.getByText("ひらがな Hiragana");

      fireEvent.click(hiraganaLink);

      expect(mockSetMobileMenuOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("Unauthenticated user with credentials enabled", () => {
    test("renders sign in options when credentials are enabled", () => {
      render(
        <MobileNavigation
          session={null}
          status="unauthenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      expect(screen.getByText("Sign In with Google")).toBeTruthy();
      expect(screen.getByText("Sign In with Credentials")).toBeTruthy();
      expect(screen.getByText("or")).toBeTruthy();
    });

    test("calls signIn with Google and closes menu", async () => {
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

    test("calls signIn with credentials and closes menu", async () => {
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
      const googleButton = loadingButtons[0];
      const credentialsButton = loadingButtons[1];

      expect(googleButton).toBeDisabled();
      expect(credentialsButton).toBeDisabled();
    });
  });

  describe("Unauthenticated user without credentials enabled", () => {
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

      expect(screen.getByText("Sign In with Google")).toBeTruthy();
      expect(screen.queryByText("Sign In with Credentials")).toBeNull();
      expect(screen.queryByText("or")).toBeNull();
    });

    test("disables Google button when status is loading", () => {
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

  describe("Edge cases", () => {
    test("handles user with empty name", () => {
      const sessionWithEmptyName = {
        user: {
          name: "",
          email: "test@example.com",
        },
      };

      render(
        <MobileNavigation
          session={sessionWithEmptyName}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      // Should show "U" as fallback when name is empty
      expect(screen.getByText("U")).toBeTruthy();
    });

    test("handles user with null name", () => {
      const sessionWithNullName = {
        user: {
          name: null,
          email: "test@example.com",
        },
      };

      render(
        <MobileNavigation
          session={sessionWithNullName}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      // Should show "U" as fallback when name is null
      expect(screen.getByText("U")).toBeTruthy();
    });

    test("handles user with special characters in name", () => {
      const sessionWithSpecialName = {
        user: {
          name: "山田太郎",
          email: "test@example.com",
        },
      };

      render(
        <MobileNavigation
          session={sessionWithSpecialName}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      // Should show first character of Japanese name
      expect(screen.getByText("山")).toBeTruthy();
      expect(screen.getByText("山田太郎")).toBeTruthy();
    });
  });

  describe("Accessibility and Styling", () => {
    test("Google sign in button has correct styling classes", () => {
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
      expect(googleButton).toHaveClass("bg-[#d1622b]", "hover:bg-[#ae0d13]");
    });

    test("credentials sign in button has correct styling classes", () => {
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
      expect(credentialsButton).toHaveClass("bg-[#403933]", "hover:bg-[#705a39]");
    });

    test("navigation links have correct accessibility attributes", () => {
      const mockSession = {
        user: {
          name: "Test User",
          email: "test@example.com",
        },
      };

      render(
        <MobileNavigation
          session={mockSession}
          status="authenticated"
          credentialsEnabled={true}
          mobileMenuOpen={true}
          setMobileMenuOpen={mockSetMobileMenuOpen}
        />
      );

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);

      // Check that links have proper styling for accessibility
      links.forEach(link => {
        expect(link).toHaveClass("min-h-[44px]");
      });
    });
  });
});
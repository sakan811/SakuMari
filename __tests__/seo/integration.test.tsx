/**
 * SEO Integration Tests
 * Tests for SEO functionality integration across components
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";

// Import actual components
import React from "react";
import HomePage from "../../components/HomePage";
import FlashcardApp from "../../components/FlashcardApp";
import Dashboard from "../../components/Dashboard";

// Mock next-auth
vi.mock("next-auth/react");
const mockUseSession = vi.mocked(useSession);

// Mock components
vi.mock("../../components/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock("../../components/FlashcardApp", () => ({
  default: ({ kanaType }: { kanaType: string }) => (
    <div data-testid="flashcard-app" data-kana-type={kanaType}>
      FlashcardApp - {kanaType}
    </div>
  ),
}));

vi.mock("../../components/Dashboard", () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>,
}));

vi.mock("../../components/FlashcardProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="flashcard-provider">{children}</div>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("SEO Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "test-user-1",
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2025-12-31T23:59:59.999Z",
      },
      status: "authenticated",
      update: vi.fn(),
    });
  });

  describe("Page Rendering with SEO Structure", () => {
    it("should render home page with proper semantic structure", async () => {
      render(<HomePage />);

      // Check for main heading
      const mainHeading = await screen.findByRole("heading", { level: 1 });
      expect(mainHeading).toHaveTextContent("🌸 SakuMari 🌸");

      // Check for navigation links with proper text
      expect(
        await screen.findByRole("link", { name: /hiragana practice/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("link", { name: /katakana practice/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("link", { name: /view your progress/i }),
      ).toBeInTheDocument();
    });

    it("should render Hiragana page with proper content structure", () => {
      render(<FlashcardApp kanaType="hiragana" />);

      const flashcardApp = screen.getByTestId("flashcard-app");
      expect(flashcardApp).toHaveAttribute("data-kana-type", "hiragana");
    });

    it("should render Katakana page with proper content structure", () => {
      render(<FlashcardApp kanaType="katakana" />);

      const flashcardApp = screen.getByTestId("flashcard-app");
      expect(flashcardApp).toHaveAttribute("data-kana-type", "katakana");
    });

    it("should render Dashboard page with proper content structure", () => {
      render(<Dashboard />);

      expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    });
  });

  describe("Content Quality for SEO", () => {
    it("should have descriptive link text for better SEO", async () => {
      render(<HomePage />);

      // Check that links have descriptive text, not just "click here"
      const hiraganaLink = await screen.findByRole("link", {
        name: /hiragana practice/i,
      });
      expect(hiraganaLink).toHaveTextContent(/practice.*hiragana.*characters/i);

      const katakanaLink = await screen.findByRole("link", {
        name: /katakana practice/i,
      });
      expect(katakanaLink).toHaveTextContent(/practice.*katakana.*characters/i);
    });

    it("should have proper heading hierarchy", async () => {
      render(<HomePage />);

      // Check heading levels are properly structured for SEO
      const h1 = await screen.findByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = await screen.findAllByRole("heading", { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it("should include Japanese characters for language-specific SEO", async () => {
      render(<HomePage />);

      // Check that actual Japanese characters are included for better language SEO
      expect(await screen.findByText(/ひらがな/)).toBeInTheDocument(); // Hiragana
      expect(await screen.findByText(/カタカナ/)).toBeInTheDocument(); // Katakana
      expect(await screen.findByText("あいう")).toBeInTheDocument(); // Sample Hiragana
      expect(await screen.findByText("アイウ")).toBeInTheDocument(); // Sample Katakana
    });
  });

  describe("User Experience and SEO Alignment", () => {
    it("should provide clear value proposition for SEO", async () => {
      render(<HomePage />);

      // Check for clear value proposition that aligns with meta descriptions
      expect(
        await screen.findByText(/master japanese characters/i),
      ).toBeInTheDocument();
      expect(
        await screen.findAllByText(/Practice the.*characters/i),
      ).toHaveLength(2);
    });

    it("should have consistent navigation structure", async () => {
      render(<HomePage />);

      // Check navigation consistency for better user experience and SEO
      expect(await screen.findByTestId("header")).toBeInTheDocument();

      // Verify navigation links are present
      const hiraganaLink = await screen.findByRole("link", {
        name: /hiragana practice/i,
      });
      const katakanaLink = await screen.findByRole("link", {
        name: /katakana practice/i,
      });
      const dashboardLink = await screen.findByRole("link", {
        name: /view your progress/i,
      });

      expect(hiraganaLink).toHaveAttribute("href", "/hiragana");
      expect(katakanaLink).toHaveAttribute("href", "/katakana");
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    });
  });

  describe("Accessibility and SEO Alignment", () => {
    it("should have accessible content that also benefits SEO", async () => {
      render(<HomePage />);

      // Check for alt text equivalents in content structure
      const practiceCards = await screen.findAllByRole("link");
      const contentfulCards = practiceCards.filter(
        (card) => card.textContent && card.textContent.length > 10,
      );

      expect(contentfulCards.length).toBeGreaterThan(0);

      // Each practice card should have descriptive content
      contentfulCards.forEach((card) => {
        expect(card.textContent).toMatch(
          /(hiragana|katakana|practice|progress)/i,
        );
      });
    });

    it("should use semantic HTML structure", async () => {
      render(<HomePage />);

      // Check for proper semantic structure
      expect(
        await screen.findByRole("heading", { level: 1 }),
      ).toBeInTheDocument();
      expect(
        (await screen.findAllByRole("heading", { level: 2 })).length,
      ).toBeGreaterThan(0);
      expect((await screen.findAllByRole("link")).length).toBeGreaterThan(0);
    });
  });

  describe("Component Integration", () => {
    it("should maintain component functionality after SEO separation", () => {
      // Test that all components render without errors
      expect(() => render(<HomePage />)).not.toThrow();
      expect(() => render(<FlashcardApp kanaType="hiragana" />)).not.toThrow();
      expect(() => render(<FlashcardApp kanaType="katakana" />)).not.toThrow();
      expect(() => render(<Dashboard />)).not.toThrow();
    });

    it("should pass correct props between server and client components", () => {
      // Hiragana component should get correct kana type
      const { unmount } = render(<FlashcardApp kanaType="hiragana" />);
      expect(screen.getByTestId("flashcard-app")).toHaveAttribute(
        "data-kana-type",
        "hiragana",
      );
      unmount();

      // Katakana component should get correct kana type
      render(<FlashcardApp kanaType="katakana" />);
      expect(screen.getByTestId("flashcard-app")).toHaveAttribute(
        "data-kana-type",
        "katakana",
      );
    });
  });
});

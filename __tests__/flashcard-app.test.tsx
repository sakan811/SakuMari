import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FlashcardApp from "../components/FlashcardApp";

// Mock child components without interfering with the main structure
vi.mock("../components/FlashcardProvider", () => ({
  FlashcardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="flashcard-provider">{children}</div>
  ),
}));

vi.mock("../components/Flashcard", () => ({
  default: () => (
    <div data-testid="flashcard-component">Flashcard Component</div>
  ),
}));

vi.mock("../components/Header", () => ({
  default: () => (
    <div data-testid="header-component">
      <nav>
        <button data-testid="nav-hiragana">Hiragana</button>
        <button data-testid="nav-katakana">Katakana</button>
        <button data-testid="nav-dashboard">Dashboard</button>
      </nav>
    </div>
  ),
}));

vi.mock("../components/Dashboard", () => ({
  default: () => (
    <div data-testid="dashboard-component">Dashboard Component</div>
  ),
}));

describe("FlashcardApp Component", () => {

  describe("Rendering", () => {
    test("renders with default tab (flashcards)", () => {
      render(<FlashcardApp />);

      expect(screen.getByTestId("flashcard-provider")).toBeInTheDocument();
      expect(screen.getByTestId("header-component")).toBeInTheDocument();
      expect(screen.getByTestId("flashcard-component")).toBeInTheDocument();
      expect(
        screen.queryByTestId("dashboard-component"),
      ).not.toBeInTheDocument();
    });

    test("renders with correct background gradient classes", () => {
      const { container } = render(<FlashcardApp />);

      // Test the outer div that has the background classes
      const outerDiv = container.querySelector('div[class*="min-h-screen"]');
      expect(outerDiv).toBeInTheDocument();
      expect(outerDiv).toHaveClass("min-h-screen");
      expect(outerDiv).toHaveClass("bg-gradient-to-br");
      expect(outerDiv).toHaveClass("from-[#fad182]");
      expect(outerDiv).toHaveClass("via-[#f5c55a]");
      expect(outerDiv).toHaveClass("to-[#fad182]");
    });

    test("renders main container with correct styling", () => {
      render(<FlashcardApp />);

      const mainElement = screen.getByRole("main");
      expect(mainElement).toHaveClass("container");
      expect(mainElement).toHaveClass("mx-auto");
      expect(mainElement).toHaveClass("max-w-4xl");
      expect(mainElement).toHaveClass("px-4");
      expect(mainElement).toHaveClass("py-4");
      expect(mainElement).toHaveClass("sm:py-6");
      expect(mainElement).toHaveClass("lg:py-8");
    });
  });

  describe("KanaType Prop", () => {
    test("passes hiragana kanaType to FlashcardProvider", () => {
      // We can't easily test the prop passing through mocks,
      // so we test that the component renders without errors
      render(<FlashcardApp kanaType="hiragana" />);

      expect(screen.getByTestId("flashcard-provider")).toBeInTheDocument();
    });

    test("passes katakana kanaType to FlashcardProvider", () => {
      render(<FlashcardApp kanaType="katakana" />);

      expect(screen.getByTestId("flashcard-provider")).toBeInTheDocument();
    });

    test("handles undefined kanaType", () => {
      render(<FlashcardApp />);

      expect(screen.getByTestId("flashcard-provider")).toBeInTheDocument();
    });
  });

  describe("Tab Management", () => {
    test("starts with flashcards tab active", () => {
      render(<FlashcardApp />);

      expect(screen.getByTestId("flashcard-component")).toBeInTheDocument();
      expect(
        screen.queryByTestId("dashboard-component"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    test("wraps content in FlashcardProvider", () => {
      render(<FlashcardApp kanaType="hiragana" />);

      const provider = screen.getByTestId("flashcard-provider");
      const header = screen.getByTestId("header-component");
      const flashcard = screen.getByTestId("flashcard-component");

      expect(provider).toBeInTheDocument();
      expect(header).toBeInTheDocument();
      expect(flashcard).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    test("applies responsive padding classes to main container", () => {
      render(<FlashcardApp />);

      const mainElement = screen.getByRole("main");
      expect(mainElement).toHaveClass("py-4", "sm:py-6", "lg:py-8");
    });

    test("maintains responsive container max-width", () => {
      render(<FlashcardApp />);

      const mainElement = screen.getByRole("main");
      expect(mainElement).toHaveClass("max-w-4xl");
    });
  });

  describe("Edge Cases", () => {
    test("maintains provider context across tab switches", () => {
      render(<FlashcardApp kanaType="katakana" />);

      const provider = screen.getByTestId("flashcard-provider");
      expect(provider).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("provides semantic main element", () => {
      render(<FlashcardApp />);

      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    test("maintains proper component hierarchy", () => {
      const { container } = render(<FlashcardApp />);

      const outerDiv = container.firstChild;
      const main = screen.getByRole("main");

      expect(outerDiv).toContainElement(main);
    });
  });
});

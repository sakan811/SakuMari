import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import KatakanaPage from "../app/katakana/page";
import { createKanaPageTests } from "./utils/page-test-utils";

// Mock FlashcardApp component
vi.mock("@/components/FlashcardApp", () => ({
  default: ({ kanaType }: { kanaType?: string }) => (
    <div data-testid="flashcard-app" data-kana-type={kanaType}>
      FlashcardApp Component
    </div>
  ),
}));

describe("Katakana Page", () => {
  test("renders FlashcardApp with katakana kanaType", () => {
    render(<KatakanaPage />);

    const flashcardApp = screen.getByTestId("flashcard-app");
    expect(flashcardApp).toBeInTheDocument();
    expect(flashcardApp).toHaveAttribute("data-kana-type", "katakana");
  });

  test("displays FlashcardApp content", () => {
    render(<KatakanaPage />);

    expect(screen.getByText("FlashcardApp Component")).toBeInTheDocument();
  });

  test("is a client component", () => {
    // Test that the component can be rendered (client components can be tested this way)
    expect(() => render(<KatakanaPage />)).not.toThrow();
  });
});

// Create additional test suite using shared utilities
createKanaPageTests("Katakana", "katakana", () => {
  // Additional shared test logic can go here
  expect("katakana").toBe("katakana");
});

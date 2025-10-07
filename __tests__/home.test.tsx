import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";
import { useSession } from "next-auth/react";

// Mock the next/navigation module
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
  })),
}));

// Mock Next.js Link component
vi.mock("next/link", () => {
  return {
    default: ({ children, href }) => {
      return <a href={href}>{children}</a>;
    },
  };
});

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("Home Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders loading spinner when session status is loading", () => {
    // Mock useSession to return loading status
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "loading",
    });

    render(<Home />);

    // Check for loading spinner with specific Tailwind CSS classes
    const spinner = document.querySelector('.rounded-full.border-2.sm\\:border-4.border-\\[\\#d1622b\\].border-t-transparent');
    expect(spinner).toBeDefined();
    expect(spinner).toHaveClass('animate-spin');
  });

  test("renders all navigation cards", () => {
    // Mock useSession to return authenticated status
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "user123", name: "Test User" } },
      status: "authenticated",
    });

    render(<Home />);

    expect(screen.getByText(/🌸 SakuMari/)).toBeDefined();
    expect(screen.getByText("ひらがな Hiragana Practice")).toBeDefined();
    expect(screen.getByText("カタカナ Katakana Practice")).toBeDefined();
    expect(screen.getByText("📊 View Your Progress")).toBeDefined();
  });

  test("contains correct navigation links", () => {
    // Mock useSession to return authenticated status
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "user123", name: "Test User" } },
      status: "authenticated",
    });

    render(<Home />);

    // Fix: Use getByText instead of getAllByText with index
    const hiraganaLink = screen
      .getByText("ひらがな Hiragana Practice")
      .closest("a");
    const katakanaLink = screen
      .getByText("カタカナ Katakana Practice")
      .closest("a");
    const progressLink = screen.getByText("📊 View Your Progress").closest("a");

    expect(hiraganaLink?.getAttribute("href")).toBe("/hiragana");
    expect(katakanaLink?.getAttribute("href")).toBe("/katakana");
    expect(progressLink?.getAttribute("href")).toBe("/dashboard");
  });
});

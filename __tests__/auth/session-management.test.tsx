import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import FlashcardApp from "@/components/FlashcardApp";

// Use the global mockFetch from setup
const mockFetch = global.mockFetch;

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => mockUseSession(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("Session Management", () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  test("handles session expiration gracefully", async () => {
    // Start with valid session
    mockUseSession.mockReturnValue({
      data: { user: { id: "user123" } },
      status: "authenticated",
    });

    let rerender: any;
    ({ rerender } = render(<FlashcardApp kanaType="hiragana" />));

    // Simulate session expiration
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    rerender(<FlashcardApp kanaType="hiragana" />);

    // Should handle gracefully without errors
    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeInTheDocument();
    });
  });

  test("maintains session state across component updates", () => {
    const sessionData = {
      user: { id: "user123", name: "Test User" },
      expires: "2025-12-31T23:59:59.999Z",
    };

    mockUseSession.mockReturnValue({
      data: sessionData,
      status: "authenticated",
    });

    let rerender: any;
    ({ rerender } = render(<FlashcardApp kanaType="hiragana" />));

    // Re-render with same session
    rerender(<FlashcardApp kanaType="katakana" />);

    // Session should persist
    expect(mockUseSession).toHaveBeenCalled();
  });

  test("handles network errors during session validation", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    mockUseSession.mockReturnValue({
      data: { user: { id: "user123" } },
      status: "authenticated",
    });

    render(<FlashcardApp kanaType="hiragana" />);

    // Should handle network errors gracefully
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlashcardApp from "../components/FlashcardApp";
import { mockKana, mockSession } from "./utils/test-helpers";

// Use the global mockFetch from setup
const mockFetch = global.mockFetch;

vi.mock("next-auth/react", () => ({
  useSession: () => mockSession(),
  SessionProvider: ({ children }) => <div>{children}</div>,
}));

describe("Integration Tests", () => {

  test("complete practice workflow", async () => {
    // Mock the initial flashcards fetch
    mockFetch.mockImplementation((url) => {
      if (url === "/api/stats") {
        return Promise.resolve({
          ok: true,
          json: async () => [mockKana.basic],
        });
      } else if (url === "/api/flashcards/submit") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<FlashcardApp kanaType="hiragana" />);

    await waitFor(() => screen.getByText("あ"));

    // Submit answer
    const input = screen.getByPlaceholderText("Type romaji equivalent...");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    // Wait for the result to appear
    await waitFor(() => screen.getByText("Correct!"));

    // Wait for the Next Card button to appear
    await waitFor(() => screen.getByRole("button", { name: "Next Card" }));

    // Click next card
    fireEvent.click(screen.getByRole("button", { name: "Next Card" }));

    await waitFor(() => expect(screen.queryByText("Correct!")).toBeNull());
  });

  test("handles authentication errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });

    render(<FlashcardApp kanaType="hiragana" />);

    // Should handle gracefully without crashing
    expect(await screen.findByRole("status")).toBeDefined();
  });
});

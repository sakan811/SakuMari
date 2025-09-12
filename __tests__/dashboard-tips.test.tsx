import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import Dashboard from "../components/Dashboard";
import { mockApiResponse } from "./utils/mock-setup";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Tips Integration", () => {
  // Create distinct mock data with different characters
  const mockStats = [
    {
      id: "1",
      character: "あ", // Hiragana
      romaji: "a",
      attempts: 10,
      correct_attempts: 8,
      accuracy: 0.8,
    },
    {
      id: "2",
      character: "ア", // Katakana
      romaji: "a",
      attempts: 10,
      correct_attempts: 8,
      accuracy: 0.8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(mockApiResponse(mockStats));
    cleanup();
  });

  test("renders tips button in header", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    const tipsButton = screen.getByRole("button", { name: /Tips/ });
    expect(tipsButton).toBeTruthy();
    expect(tipsButton.textContent).toContain("💡 Tips");
  });

  test("opens tips modal when tips button is clicked", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    const tipsButton = screen.getByRole("button", { name: /Tips/ });
    fireEvent.click(tipsButton);

    expect(screen.getByText("Kana Learning Tips")).toBeTruthy();
    expect(
      screen.getByText("Ask questions about Japanese kana"),
    ).toBeTruthy();
  });

  test("closes tips modal when close button is clicked", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Open modal
    const tipsButton = screen.getByRole("button", { name: /Tips/ });
    fireEvent.click(tipsButton);

    // Verify modal is open
    expect(screen.getByText("Kana Learning Tips")).toBeTruthy();

    // Close modal
    const closeButton = screen.getByRole("button", {
      name: "Close tips modal",
    });
    fireEvent.click(closeButton);

    // Modal should be closed (content not visible)
    expect(screen.queryByText("Kana Learning Tips")).toBeNull();
  });

  test("tips modal shows welcome message initially", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    const tipsButton = screen.getByRole("button", { name: /Tips/ });
    fireEvent.click(tipsButton);

    expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeTruthy();
    expect(
      screen.getByText(
        "Ask me anything about learning Japanese hiragana and katakana.",
      ),
    ).toBeTruthy();
  });

  test("tips button has correct styling", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    const tipsButton = screen.getByRole("button", { name: /Tips/ });
    expect(tipsButton.className).toContain("bg-gradient-to-br");
    expect(tipsButton.className).toContain("from-[#d1622b]/80");
    expect(tipsButton.className).toContain("to-[#ae0d13]/80");
  });

  test("tips modal is not rendered when closed", () => {
    render(<Dashboard />);

    // Tips modal content should not be present initially
    expect(screen.queryByText("Kana Learning Tips")).toBeNull();
    expect(
      screen.queryByText("Ask questions about Japanese kana"),
    ).toBeNull();
  });
});
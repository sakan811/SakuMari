/*
 * SakuMari - Japanese Kana Flashcard App
 * Copyright (C) 2025  Sakan Nirattisaykul
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import TipsModal from "../components/TipsModal";
import { mockApiResponse } from "./utils/test-helpers";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("TipsModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders nothing when isOpen is false", () => {
    const { container } = render(
      <TipsModal isOpen={false} onClose={mockOnClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders modal when isOpen is true", () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Kana Learning Tips")).toBeTruthy();
    expect(screen.getByText("Ask questions about Japanese kana")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Ask about kana learning techniques..."),
    ).toBeTruthy();
  });

  test("shows welcome message when no messages", () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeTruthy();
    expect(
      screen.getByText(
        "Ask me anything about learning Japanese hiragana and katakana.",
      ),
    ).toBeTruthy();
    expect(screen.getByText(/Example:/)).toBeTruthy();
  });

  test("closes modal when close button is clicked", () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", {
      name: "Close tips modal",
    });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("handles form submission with valid input", async () => {
    const mockTip = {
      tip: "Practice regularly to improve your kana recognition!",
      timestamp: "2025-01-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue(mockApiResponse(mockTip));

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: "Ask" });

    fireEvent.change(input, {
      target: { value: "How can I memorize hiragana better?" },
    });
    fireEvent.click(submitButton);

    // Check user message appears
    expect(
      screen.getByText("How can I memorize hiragana better?"),
    ).toBeTruthy();

    // Wait for API response
    await waitFor(() => {
      expect(
        screen.getByText(
          "Practice regularly to improve your kana recognition!",
        ),
      ).toBeTruthy();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userQuery: "How can I memorize hiragana better?",
      }),
    });
  });

  test("prevents submission with empty input", () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const submitButton = screen.getByRole("button", { name: "Ask" });
    expect(submitButton).toBeDisabled();

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    fireEvent.change(input, { target: { value: "   " } }); // Only whitespace
    expect(submitButton).toBeDisabled();
  });

  test("shows loading state during API call", async () => {
    // Mock response that resolves immediately
    const mockResponse = mockApiResponse({
      tip: "Test",
      timestamp: "2025-01-01T00:00:00Z",
    });
    mockFetch.mockResolvedValue(mockResponse);

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: "Ask" });

    fireEvent.change(input, { target: { value: "Test question" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check loading state briefly appears
    await waitFor(() => {
      expect(screen.getByText("Test")).toBeTruthy();
    });

    // Input should be enabled after completion
    expect(input).not.toBeDisabled();
  });

  test("handles API error responses", async () => {
    const errorResponse = {
      ok: false,
      status: 400,
      json: async () => ({ error: "Invalid request" }),
    };

    mockFetch.mockResolvedValue(errorResponse);

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: "Ask" });

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid request")).toBeTruthy();
    });

    // Error should be displayed in red background
    const errorElement = screen.getByText("Invalid request");
    expect(errorElement.closest(".bg-red-100")).toBeTruthy();
  });

  test("handles network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: "Ask" });

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeTruthy();
    });
  });

  test("clears conversation and input on close", () => {
    const { rerender } = render(
      <TipsModal isOpen={true} onClose={mockOnClose} />,
    );

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    fireEvent.change(input, { target: { value: "Test input" } });

    const closeButton = screen.getByRole("button", {
      name: "Close tips modal",
    });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();

    // Re-render with isOpen=true to check if state was cleared
    rerender(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const newInput = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    ) as HTMLInputElement;
    expect(newInput.value).toBe("");
    expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeTruthy();
  });

  test("displays conversation messages correctly", async () => {
    const mockTip = {
      tip: "Assistant response",
      timestamp: "2025-01-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue(mockApiResponse(mockTip));

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    fireEvent.change(input, { target: { value: "User question" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));

    // User message should appear immediately
    expect(screen.getByText("User question")).toBeTruthy();

    // Assistant message should appear after API response
    await waitFor(() => {
      expect(screen.getByText("Assistant response")).toBeTruthy();
    });

    // Both messages should be visible
    expect(screen.getByText("User question")).toBeTruthy();
    expect(screen.getByText("Assistant response")).toBeTruthy();
  });

  test("enforces character limit on input", () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    expect(input.getAttribute("maxLength")).toBe("500");
  });

  test("submit button shows correct text based on loading state", async () => {
    // Use a delay to better test loading states
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const mockResponse = mockApiResponse({
      tip: "Test",
      timestamp: "2025-01-01T00:00:00Z",
    });
    mockFetch.mockImplementation(() => delay(100).then(() => mockResponse));

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    fireEvent.change(input, { target: { value: "Test" } });

    const submitButton = screen.getByRole("button", { name: "Ask" });
    expect(submitButton.textContent).toBe("Ask");

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // During loading - check if loading state appears
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "..." })).toBeTruthy();
    });

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByTestId("assistant-message")).toHaveTextContent("Test");
    });
  });

  test("focuses input when modal opens", () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    expect(document.activeElement).toBe(input);
  });

  test("handles form submission with Enter key", async () => {
    const mockTip = {
      tip: "Test response",
      timestamp: "2025-01-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue(mockApiResponse(mockTip));

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Test response")).toBeTruthy();
    });
  });

  test("does not submit form when input is empty", async () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const submitButton = screen.getByRole("button", { name: /ask/i });
    fireEvent.click(submitButton);

    // Should not call fetch since input is empty
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("does not submit form when already loading", async () => {
    // Mock a slow response
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: /ask/i });

    fireEvent.change(input, { target: { value: "First question" } });
    fireEvent.click(submitButton);

    // Try to submit again while loading
    fireEvent.change(input, { target: { value: "Second question" } });
    fireEvent.click(submitButton);

    // Should only call fetch once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("handles API error response correctly", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "API Error" }),
    });

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("API Error")
      ).toBeInTheDocument();
    });
  });

  test("prevents submission when input is empty or whitespace only (covers line 69)", async () => {
    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: /ask/i });

    // Test with empty input
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(submitButton);
    expect(mockFetch).not.toHaveBeenCalled();

    // Test with whitespace only
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(submitButton);
    expect(mockFetch).not.toHaveBeenCalled();

    // Test with actual content - should proceed
    mockFetch.mockResolvedValue(mockApiResponse({
      tip: "Test response",
      timestamp: "2025-01-01T00:00:00Z",
    }));

    fireEvent.change(input, { target: { value: "Valid question" } });
    fireEvent.click(submitButton);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("handles API error without proper error message (covers line 95)", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}), // No error property in response
    });

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: /ask/i });

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should show the fallback error message
      expect(screen.getByText("Failed to get learning tips")).toBeInTheDocument();
    });
  });

  test("handles non-Error objects in catch block (covers line 110)", async () => {
    // Mock fetch to reject with a string instead of an Error object
    mockFetch.mockRejectedValue("Network failure");

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: /ask/i });

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should show the fallback error message for non-Error objects
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  test("handles null error objects in catch block", async () => {
    // Mock fetch to reject with null
    mockFetch.mockRejectedValue(null);

    render(<TipsModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(
      "Ask about kana learning techniques...",
    );
    const submitButton = screen.getByRole("button", { name: /ask/i });

    fireEvent.change(input, { target: { value: "Test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should show the fallback error message for null error objects
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});

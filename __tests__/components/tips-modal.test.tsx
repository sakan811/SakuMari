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
 * You should have received a copy of the GNU Affero General Public License
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
import TipsModal from "../../components/TipsModal";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockApiResponse = (data: any) => ({
  ok: true,
  json: async () => data,
});

describe("TipsModal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("Basic Modal Functionality", () => {
    test("does not render when isOpen is false", () => {
      const { container } = render(
        <TipsModal isOpen={false} onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });

    test("renders modal when isOpen is true", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Kana Learning Tips")).toBeInTheDocument();
      expect(screen.getByText("Ask questions about Japanese kana")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Ask about kana learning techniques...")
      ).toBeInTheDocument();
    });

    test("calls onClose when close button is clicked", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", {
        name: "Close tips modal",
      });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("focuses input when modal opens", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      expect(document.activeElement).toBe(input);
    });
  });

  describe("Welcome Message Display", () => {
    test("displays welcome content when no messages", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Ask me anything about learning Japanese hiragana and katakana."
        )
      ).toBeInTheDocument();
      expect(screen.getByText(/Example:/)).toBeInTheDocument();
    });
  });

  describe("Input Handling", () => {
    test("allows typing in input field", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      fireEvent.change(input, { target: { value: "How do I learn hiragana?" } });

      expect(input).toHaveValue("How do I learn hiragana?");
    });

    test("disables submit button when input is empty", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: "Ask" });
      expect(submitButton).toBeDisabled();
    });

    test("enables submit button when input has text", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "test question" } });

      expect(submitButton).not.toBeDisabled();
    });

    test("prevents submission when input is only whitespace", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(submitButton);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test("enforces character limit on input", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      expect(input.getAttribute("maxLength")).toBe("500");
    });
  });

  describe("Form Submission", () => {
    test("handles form submission with valid input", async () => {
      const mockTip = {
        tip: "Practice regularly to improve your kana recognition!",
        timestamp: "2025-01-01T00:00:00Z",
      };

      mockFetch.mockResolvedValue(mockApiResponse(mockTip));

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, {
        target: { value: "How can I memorize hiragana better?" },
      });
      fireEvent.click(submitButton);

      // Check user message appears
      expect(
        screen.getByText("How can I memorize hiragana better?")
      ).toBeInTheDocument();

      // Wait for API response
      await waitFor(() => {
        expect(
          screen.getByText(
            "Practice regularly to improve your kana recognition!"
          )
        ).toBeInTheDocument();
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

    test("handles form submission with Enter key", async () => {
      const mockTip = {
        tip: "Test response",
        timestamp: "2025-01-01T00:00:00Z",
      };

      mockFetch.mockResolvedValue(mockApiResponse(mockTip));

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      fireEvent.change(input, { target: { value: "Test question" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText("Test response")).toBeInTheDocument();
      });
    });

    test("trims input whitespace on submission", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          tip: "Response",
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      fireEvent.change(input, { target: { value: "  trimmed message  " } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText("trimmed message")).toBeInTheDocument();
        expect(screen.queryByText("  trimmed message  ")).toBeNull();
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuery: "trimmed message",
        }),
      });
    });
  });

  describe("Loading States", () => {
    test("shows loading state during API call", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "Test question" } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(screen.getByText("...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test("prevents submission when already loading", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "first question" } });
      fireEvent.click(submitButton);

      // Try to submit again while loading
      fireEvent.change(input, { target: { value: "second question" } });
      fireEvent.click(submitButton);

      // Should only call fetch once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    test("handles API error responses", async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid request" }),
      };

      mockFetch.mockResolvedValue(errorResponse);

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "Test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid request")).toBeInTheDocument();
      });

      // Error should be displayed in red background
      const errorElement = screen.getByText("Invalid request");
      expect(errorElement.closest(".bg-red-100")).toBeInTheDocument();
    });

    test("handles network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "Test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    test("handles non-Error objects in catch block", async () => {
      mockFetch.mockRejectedValue("Network failure");

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "Test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });
    });

    test("handles null error objects in catch block", async () => {
      mockFetch.mockRejectedValue(null);

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "Test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });
    });

    test("handles API error without proper error message", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}), // No error property in response
      });

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "Test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to get learning tips")).toBeInTheDocument();
      });
    });

    test("clears error when submitting new message", async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error("First error"));

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      const submitButton = screen.getByRole("button", { name: "Ask" });

      fireEvent.change(input, { target: { value: "first question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First error")).toBeInTheDocument();
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tip: "Success response",
          timestamp: new Date().toISOString(),
        }),
      });

      fireEvent.change(input, { target: { value: "second question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText("First error")).toBeNull();
        expect(screen.getByText("Success response")).toBeInTheDocument();
      });
    });
  });

  describe("Message Display", () => {
    test("displays user messages correctly", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          tip: "Response message",
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      fireEvent.change(input, { target: { value: "User message here" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        const userMessage = screen.getByTestId("user-message");
        expect(userMessage).toHaveTextContent("User message here");
        expect(userMessage).toHaveClass("bg-[#d1622b]", "text-white");
      });
    });

    test("displays assistant messages correctly", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          tip: "Assistant response here",
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        const assistantMessage = screen.getByTestId("assistant-message");
        expect(assistantMessage).toHaveTextContent("Assistant response here");
        expect(assistantMessage).toHaveClass("bg-white", "border-2", "text-[#403933]");
      });
    });
  });

  describe("Component Lifecycle", () => {
    test("clears conversation and input on close", () => {
      const { rerender } = render(
        <TipsModal isOpen={true} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
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
        "Ask about kana learning techniques..."
      ) as HTMLInputElement;
      expect(newInput.value).toBe("");
      expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeInTheDocument();
    });

    test("handles component unmount during async operation", async () => {
      let resolvePromise: (value: { ok: boolean; json: () => Promise<{ tip: string; timestamp: string }> }) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValue(promise);

      const { unmount } = render(
        <TipsModal isOpen={true} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.submit(input.closest("form")!);

      // Unmount component while request is in progress
      unmount();

      // Resolve the promise (should not cause errors)
      resolvePromise({
        ok: true,
        json: async () => ({
          tip: "Should not appear",
          timestamp: new Date().toISOString(),
        }),
      });
    });
  });

  describe("Accessibility", () => {
    test("has proper ARIA labels", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText("Close tips modal");
      expect(closeButton).toBeInTheDocument();

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("maxLength", "500");
    });

    test("maintains focus management", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Ask about kana learning techniques..."
      );
      expect(input).toHaveFocus();
    });
  });
});
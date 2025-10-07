import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TipsModal from "../../components/TipsModal";

describe("TipsModal Component", () => {
  const mockOnClose = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Modal Functionality", () => {
    test("does not render when isOpen is false", () => {
      render(<TipsModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText("Kana Learning Tips")).toBeNull();
      expect(screen.queryByText("💡 Tips")).toBeNull();
    });

    test("renders modal when isOpen is true", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Kana Learning Tips")).toBeTruthy();
      expect(screen.getByText("Ask questions about Japanese kana")).toBeTruthy();
      expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeTruthy();
    });

    test("calls onClose when close button is clicked", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText("Close tips modal");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("focuses input when modal opens", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      expect(input).toHaveFocus();
    });
  });

  describe("Welcome Message Display", () => {
    test("displays welcome content when no messages", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeTruthy();
      expect(screen.getByText("Ask me anything about learning Japanese hiragana and katakana.")).toBeTruthy();
      expect(screen.getByText(/Example: .*How can I memorize hiragana faster\?.*/)).toBeTruthy();
      expect(screen.getByText("🌸")).toBeTruthy();
    });
  });

  describe("Input Handling", () => {
    test("allows typing in input field", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      fireEvent.change(input, { target: { value: "How do I learn hiragana?" } });

      expect(input).toHaveValue("How do I learn hiragana?");
    });

    test("disables submit button when input is empty", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const submitButton = screen.getByText("Ask");
      expect(submitButton).toBeDisabled();
    });

    test("enables submit button when input has text", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "test question" } });

      expect(submitButton).not.toBeDisabled();
    });

    test("disables submit button when loading", () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "test question" } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText("...")).toBeTruthy();
    });

    test("prevents submission when input is only whitespace", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(submitButton);

      // Should not submit and should not call fetch
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    test("submits form successfully with user message", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          tip: "Here's a great tip for learning hiragana!",
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "How can I learn hiragana faster?" } });
      fireEvent.submit(form);

      // Check that user message is displayed
      await waitFor(() => {
        expect(screen.getByText("How can I learn hiragana faster?")).toBeTruthy();
      });

      // Check that API was called correctly
      expect(mockFetch).toHaveBeenCalledWith("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuery: "How can I learn hiragana faster?",
        }),
      });

      // Check that assistant response is displayed
      await waitFor(() => {
        expect(screen.getByText("Here's a great tip for learning hiragana!")).toBeTruthy();
      });
    });

    test("handles API error response", async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: "API rate limit exceeded",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("API rate limit exceeded")).toBeTruthy();
      });
    });

    test("handles network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeTruthy();
      });
    });

    test("handles unknown error type", async () => {
      mockFetch.mockRejectedValue("Unknown error");

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "test question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeTruthy();
      });
    });

    test("clears error when submitting new message", async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error("First error"));

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "first question" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First error")).toBeTruthy();
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
        expect(screen.getByText("Success response")).toBeTruthy();
      });
    });

    test("prevents submission when already loading", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const submitButton = screen.getByText("Ask");

      fireEvent.change(input, { target: { value: "first question" } });
      fireEvent.click(submitButton);

      // Try to submit again while loading
      fireEvent.change(input, { target: { value: "second question" } });
      fireEvent.click(submitButton);

      // Should only call fetch once
      expect(mockFetch).toHaveBeenCalledTimes(1);
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

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
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

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        const assistantMessage = screen.getByTestId("assistant-message");
        expect(assistantMessage).toHaveTextContent("Assistant response here");
        expect(assistantMessage).toHaveClass("bg-white", "border-2", "text-[#403933]");
      });
    });

    test("displays loading indicator correctly", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText("Thinking...")).toBeTruthy();
        expect(screen.getByText("...")).toBeTruthy();

        // Check for animated dots
        const animatedDots = document.querySelectorAll('.animate-pulse');
        expect(animatedDots.length).toBe(3);
      });
    });
  });

  describe("Component Lifecycle", () => {
    test("resets state when modal closes", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          tip: "Response message",
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { rerender } = render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      fireEvent.change(input, { target: { value: "test message" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText("test message")).toBeTruthy();
        expect(screen.getByText("Response message")).toBeTruthy();
      });

      // Close modal
      rerender(<TipsModal isOpen={false} onClose={mockOnClose} />);

      // Reopen modal
      rerender(<TipsModal isOpen={true} onClose={mockOnClose} />);

      // Should be back to welcome state
      expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeTruthy();
      expect(input).toHaveValue("");
      expect(screen.queryByText("test message")).toBeNull();
      expect(screen.queryByText("Response message")).toBeNull();
    });

    test("handles component unmount during async operation", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValue(promise);

      const { unmount } = render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
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
      expect(closeButton).toBeTruthy();

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("maxLength", "500");
    });

    test("maintains focus management", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      expect(input).toHaveFocus();
    });
  });

  describe("Input Validation", () => {
    test("handles very long input within maxLength", () => {
      render(<TipsModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      const longText = "a".repeat(500);

      fireEvent.change(input, { target: { value: longText } });

      expect(input).toHaveValue(longText);
      expect(screen.getByText("Ask")).not.toBeDisabled();
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

      const input = screen.getByPlaceholderText("Ask about kana learning techniques...");
      fireEvent.change(input, { target: { value: "  trimmed message  " } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText("trimmed message")).toBeTruthy();
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
});
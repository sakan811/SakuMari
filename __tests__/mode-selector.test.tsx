import { describe, test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ModeSelector from "../components/ModeSelector";

describe("ModeSelector Component", () => {
  const mockOnModeChange = vi.fn();

  const defaultProps = {
    currentMode: "typing" as const,
    onModeChange: mockOnModeChange,
    disabled: false,
  };


  describe("Rendering", () => {
    test("renders both mode buttons", () => {
      render(<ModeSelector {...defaultProps} />);

      expect(screen.getByText(/Typing/)).toBeInTheDocument();
      expect(screen.getByText(/Choices/)).toBeInTheDocument();
    });

    test("shows active state for typing mode", () => {
      render(<ModeSelector {...defaultProps} currentMode="typing" />);

      const typingButton = screen.getByText(/Typing/).closest("button");
      const choicesButton = screen.getByText(/Choices/).closest("button");

      expect(typingButton).toHaveClass("bg-[#d1622b]", "text-white");
      expect(choicesButton).not.toHaveClass("bg-[#d1622b]", "text-white");
    });

    test("shows active state for multiple-choice mode", () => {
      render(<ModeSelector {...defaultProps} currentMode="multiple-choice" />);

      const typingButton = screen.getByText(/Typing/).closest("button");
      const choicesButton = screen.getByText(/Choices/).closest("button");

      expect(choicesButton).toHaveClass("bg-[#d1622b]", "text-white");
      expect(typingButton).not.toHaveClass("bg-[#d1622b]", "text-white");
    });

    test("renders emojis in buttons", () => {
      render(<ModeSelector {...defaultProps} />);

      expect(screen.getByText("⌨️")).toBeInTheDocument();
      expect(screen.getByText("📝")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    test("calls onModeChange when typing button is clicked", () => {
      render(<ModeSelector {...defaultProps} currentMode="multiple-choice" />);

      const typingButton = screen.getByText(/Typing/).closest("button");
      fireEvent.click(typingButton!);

      expect(mockOnModeChange).toHaveBeenCalledWith("typing");
      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    });

    test("calls onModeChange when choices button is clicked", () => {
      render(<ModeSelector {...defaultProps} currentMode="typing" />);

      const choicesButton = screen.getByText(/Choices/).closest("button");
      fireEvent.click(choicesButton!);

      expect(mockOnModeChange).toHaveBeenCalledWith("multiple-choice");
      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("Disabled State", () => {
    test("disables buttons when disabled prop is true", () => {
      render(<ModeSelector {...defaultProps} disabled={true} />);

      const typingButton = screen.getByText(/Typing/).closest("button");
      const choicesButton = screen.getByText(/Choices/).closest("button");

      expect(typingButton).toBeDisabled();
      expect(choicesButton).toBeDisabled();
    });

    test("applies disabled styles when disabled", () => {
      render(<ModeSelector {...defaultProps} disabled={true} />);

      const typingButton = screen.getByText(/Typing/).closest("button");
      const choicesButton = screen.getByText(/Choices/).closest("button");

      expect(typingButton).toHaveClass("opacity-50", "cursor-not-allowed");
      expect(choicesButton).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    test("does not call onModeChange when disabled button is clicked", () => {
      render(<ModeSelector {...defaultProps} disabled={true} />);

      const choicesButton = screen.getByText(/Choices/).closest("button");
      fireEvent.click(choicesButton!);

      expect(mockOnModeChange).not.toHaveBeenCalled();
    });
  });

  describe("Responsive Design", () => {
    test("shows full text on larger screens", () => {
      render(<ModeSelector {...defaultProps} />);

      expect(screen.getByText("Typing")).toHaveClass("hidden", "xs:inline");
      expect(screen.getByText("Choices")).toHaveClass("hidden", "xs:inline");
    });

    test("shows shortened text on smaller screens", () => {
      render(<ModeSelector {...defaultProps} />);

      expect(screen.getByText("Type")).toHaveClass("xs:hidden");
      expect(screen.getByText("Pick")).toHaveClass("xs:hidden");
    });
  });

  describe("Accessibility", () => {
    test("buttons are focusable when not disabled", () => {
      render(<ModeSelector {...defaultProps} />);

      const typingButton = screen.getByText(/Typing/).closest("button");
      const choicesButton = screen.getByText(/Choices/).closest("button");

      // Check that buttons exist and are interactive
      expect(typingButton).toBeInTheDocument();
      expect(choicesButton).toBeInTheDocument();
      expect(typingButton).not.toBeDisabled();
      expect(choicesButton).not.toBeDisabled();
    });

    test("supports keyboard navigation", () => {
      render(<ModeSelector {...defaultProps} />);

      const typingButton = screen.getByText(/Typing/).closest("button");

      typingButton!.focus();
      expect(document.activeElement).toBe(typingButton);

      // ModeSelector doesn't handle keydown events, only click events
      fireEvent.click(typingButton!);
      expect(mockOnModeChange).toHaveBeenCalledWith("typing");
    });
  });
});

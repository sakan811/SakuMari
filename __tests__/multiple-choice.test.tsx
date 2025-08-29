import { describe, test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MultipleChoice from "../components/MultipleChoice";

describe("MultipleChoice Component", () => {
  const mockChoices = ["a", "ka", "sa", "ta"];
  const mockOnChoiceSelect = vi.fn();

  const defaultProps = {
    choices: mockChoices,
    selectedChoice: null,
    onChoiceSelect: mockOnChoiceSelect,
    disabled: false,
    error: undefined,
  };

  describe("Rendering", () => {
    test("renders all choices as buttons", () => {
      render(<MultipleChoice {...defaultProps} />);

      mockChoices.forEach((choice) => {
        expect(screen.getByText(choice)).toBeInTheDocument();
      });
    });

    test("renders loading state when no choices provided", () => {
      render(<MultipleChoice {...defaultProps} choices={[]} />);

      expect(screen.getByText("Loading choices...")).toBeInTheDocument();
    });

    test("shows instruction text", () => {
      render(<MultipleChoice {...defaultProps} />);

      expect(screen.getByText("Tap to select your answer")).toBeInTheDocument();
    });

    test("displays error message when error prop is provided", () => {
      const errorMessage = "Please select an answer";
      render(<MultipleChoice {...defaultProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Selection State", () => {
    test("shows selected state for chosen option", () => {
      render(<MultipleChoice {...defaultProps} selectedChoice={1} />);

      const selectedButton = screen.getByText("ka").closest("button");
      const unselectedButton = screen.getByText("a").closest("button");

      expect(selectedButton).toHaveClass("border-[#d1622b]", "bg-[#fad182]/40");
      expect(unselectedButton).toHaveClass("border-[#705a39]", "bg-white");
    });

    test("shows checkmark for selected choice", () => {
      render(<MultipleChoice {...defaultProps} selectedChoice={2} />);

      expect(screen.getByLabelText("Selected")).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    test("does not show checkmark for unselected choices", () => {
      render(<MultipleChoice {...defaultProps} selectedChoice={0} />);

      // Only one checkmark should be present
      expect(screen.getAllByText("✓")).toHaveLength(1);
    });
  });

  describe("Interactions", () => {
    test("calls onChoiceSelect when choice is clicked", () => {
      render(<MultipleChoice {...defaultProps} />);

      const firstChoice = screen.getByText("a").closest("button");
      fireEvent.click(firstChoice!);

      expect(mockOnChoiceSelect).toHaveBeenCalledWith(0);
      expect(mockOnChoiceSelect).toHaveBeenCalledTimes(1);
    });

    test("calls onChoiceSelect with correct index for different choices", () => {
      render(<MultipleChoice {...defaultProps} />);

      const secondChoice = screen.getByText("ka").closest("button");
      const thirdChoice = screen.getByText("sa").closest("button");

      fireEvent.click(secondChoice!);
      expect(mockOnChoiceSelect).toHaveBeenCalledWith(1);

      fireEvent.click(thirdChoice!);
      expect(mockOnChoiceSelect).toHaveBeenCalledWith(2);
    });
  });

  describe("Keyboard Navigation", () => {
    test("handles Enter key to select choice", () => {
      render(<MultipleChoice {...defaultProps} />);

      const firstChoice = screen.getByText("a").closest("button");
      fireEvent.keyDown(firstChoice!, { key: "Enter" });

      expect(mockOnChoiceSelect).toHaveBeenCalledWith(0);
    });

    test("handles Space key to select choice", () => {
      render(<MultipleChoice {...defaultProps} />);

      const secondChoice = screen.getByText("ka").closest("button");
      fireEvent.keyDown(secondChoice!, { key: " " });

      expect(mockOnChoiceSelect).toHaveBeenCalledWith(1);
    });

    test("ignores other keys", () => {
      render(<MultipleChoice {...defaultProps} />);

      const firstChoice = screen.getByText("a").closest("button");
      fireEvent.keyDown(firstChoice!, { key: "Tab" });
      fireEvent.keyDown(firstChoice!, { key: "Escape" });

      expect(mockOnChoiceSelect).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    test("disables all choice buttons when disabled", () => {
      render(<MultipleChoice {...defaultProps} disabled={true} />);

      mockChoices.forEach((choice) => {
        const button = screen.getByText(choice).closest("button");
        expect(button).toBeDisabled();
      });
    });

    test("applies disabled styles when disabled", () => {
      render(<MultipleChoice {...defaultProps} disabled={true} />);

      const firstButton = screen.getByText("a").closest("button");
      expect(firstButton).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    test("does not call onChoiceSelect when disabled button is clicked", () => {
      render(<MultipleChoice {...defaultProps} disabled={true} />);

      const firstChoice = screen.getByText("a").closest("button");
      fireEvent.click(firstChoice!);

      expect(mockOnChoiceSelect).not.toHaveBeenCalled();
    });

    test("sets tabIndex to -1 when disabled", () => {
      render(<MultipleChoice {...defaultProps} disabled={true} />);

      const firstButton = screen.getByText("a").closest("button");
      expect(firstButton).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Accessibility", () => {
    test("provides proper aria-labels for choices", () => {
      render(<MultipleChoice {...defaultProps} />);

      mockChoices.forEach((choice, index) => {
        const button = screen.getByLabelText(`Choice ${index + 1}: ${choice}`);
        expect(button).toBeInTheDocument();
      });
    });

    test("error message has proper ARIA attributes", () => {
      const errorMessage = "Please select an answer";
      render(<MultipleChoice {...defaultProps} error={errorMessage} />);

      const errorElement = screen.getByRole("alert");
      expect(errorElement).toHaveAttribute("aria-live", "polite");
    });

    test("choice buttons are properly focusable", () => {
      render(<MultipleChoice {...defaultProps} />);

      mockChoices.forEach((choice) => {
        const button = screen.getByText(choice).closest("button");
        expect(button).toHaveAttribute("tabIndex", "0");
      });
    });
  });

  describe("Edge Cases", () => {
    test("handles empty choices array gracefully", () => {
      render(<MultipleChoice {...defaultProps} choices={[]} />);

      expect(screen.getByText("Loading choices...")).toBeInTheDocument();
      // When choices are empty, the instruction text is not shown
      expect(
        screen.queryByText("Tap to select your answer"),
      ).not.toBeInTheDocument();
    });

    test("handles special characters in choices", () => {
      const specialChoices = ["あ", "か", "が", "きゃ"];
      render(<MultipleChoice {...defaultProps} choices={specialChoices} />);

      specialChoices.forEach((choice) => {
        expect(screen.getByText(choice)).toBeInTheDocument();
      });
    });

    test("maintains unique keys for dynamically generated choices", () => {
      const duplicateChoices = ["a", "a", "ka", "ka"];
      render(<MultipleChoice {...defaultProps} choices={duplicateChoices} />);

      // Should render all buttons even with duplicate text
      expect(screen.getAllByText("a")).toHaveLength(2);
      expect(screen.getAllByText("ka")).toHaveLength(2);
    });
  });
});

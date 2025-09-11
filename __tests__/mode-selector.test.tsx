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

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ModeSelector from "@/components/ModeSelector";
import React from "react";

describe("ModeSelector Component Tests", () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders both mode buttons", () => {
    render(
      <ModeSelector
        currentMode="typing"
        onModeChange={mockOnModeChange}
        disabled={false}
      />,
    );

    expect(screen.getByTestId("typing-button")).toBeInTheDocument();
    expect(screen.getByTestId("multiple-choice-button")).toBeInTheDocument();

    // Check button labels
    expect(screen.getByText("Typing")).toBeInTheDocument();
    expect(screen.getByText("Choices")).toBeInTheDocument();
  });

  test("shows correct active state for typing mode", () => {
    render(
      <ModeSelector
        currentMode="typing"
        onModeChange={mockOnModeChange}
        disabled={false}
      />,
    );

    const typingButton = screen.getByTestId("typing-button");
    const multipleChoiceButton = screen.getByTestId("multiple-choice-button");

    // Typing button should be active
    expect(typingButton).toHaveClass("bg-[#d1622b]");
    expect(typingButton).toHaveClass("text-white");

    // Multiple choice button should be inactive
    expect(multipleChoiceButton).not.toHaveClass("bg-[#d1622b]");
    expect(multipleChoiceButton).not.toHaveClass("text-white");
  });

  test("shows correct active state for multiple choice mode", () => {
    render(
      <ModeSelector
        currentMode="multiple-choice"
        onModeChange={mockOnModeChange}
        disabled={false}
      />,
    );

    const typingButton = screen.getByTestId("typing-button");
    const multipleChoiceButton = screen.getByTestId("multiple-choice-button");

    // Multiple choice button should be active
    expect(multipleChoiceButton).toHaveClass("bg-[#d1622b]");
    expect(multipleChoiceButton).toHaveClass("text-white");

    // Typing button should be inactive
    expect(typingButton).not.toHaveClass("bg-[#d1622b]");
    expect(typingButton).not.toHaveClass("text-white");
  });

  test("calls onModeChange with correct value when typing button is clicked", () => {
    render(
      <ModeSelector
        currentMode="multiple-choice"
        onModeChange={mockOnModeChange}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByTestId("typing-button"));

    expect(mockOnModeChange).toHaveBeenCalledWith("typing");
  });

  test("calls onModeChange with correct value when multiple choice button is clicked", () => {
    render(
      <ModeSelector
        currentMode="typing"
        onModeChange={mockOnModeChange}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByTestId("multiple-choice-button"));

    expect(mockOnModeChange).toHaveBeenCalledWith("multiple-choice");
  });

  test("disables buttons when disabled prop is true", () => {
    render(
      <ModeSelector
        currentMode="typing"
        onModeChange={mockOnModeChange}
        disabled={true}
      />,
    );

    const typingButton = screen.getByTestId("typing-button");
    const multipleChoiceButton = screen.getByTestId("multiple-choice-button");

    expect(typingButton).toBeDisabled();
    expect(multipleChoiceButton).toBeDisabled();

    expect(typingButton).toHaveClass("opacity-50");
    expect(multipleChoiceButton).toHaveClass("opacity-50");
  });

  test("does not call onModeChange when disabled", () => {
    render(
      <ModeSelector
        currentMode="typing"
        onModeChange={mockOnModeChange}
        disabled={true}
      />,
    );

    fireEvent.click(screen.getByTestId("multiple-choice-button"));

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });
  // Tests from mode-selector-uncovered.test.tsx
  test("uses default disabled value when not provided", () => {
    render(
      <ModeSelector
        currentMode="typing"
        onModeChange={mockOnModeChange}
      />,
    );

    const typingButton = screen.getByTestId("typing-button");
    const multipleChoiceButton = screen.getByTestId("multiple-choice-button");

    // Buttons should not be disabled by default
    expect(typingButton).not.toBeDisabled();
    expect(multipleChoiceButton).not.toBeDisabled();
    
    // Buttons should not have disabled styling
    expect(typingButton).not.toHaveClass("opacity-50");
    expect(typingButton).not.toHaveClass("cursor-not-allowed");
    expect(multipleChoiceButton).not.toHaveClass("opacity-50");
    expect(multipleChoiceButton).not.toHaveClass("cursor-not-allowed");
  });

  test("explicitly setting disabled to false works the same as default", () => {
    render(
      <ModeSelector
        currentMode="typing"
        onModeChange={mockOnModeChange}
        disabled={false}
      />,
    );

    const typingButton = screen.getByTestId("typing-button");
    const multipleChoiceButton = screen.getByTestId("multiple-choice-button");

    // Buttons should not be disabled
    expect(typingButton).not.toBeDisabled();
    expect(multipleChoiceButton).not.toBeDisabled();
    
    // Buttons should not have disabled styling
    expect(typingButton).not.toHaveClass("opacity-50");
    expect(typingButton).not.toHaveClass("cursor-not-allowed");
    expect(multipleChoiceButton).not.toHaveClass("opacity-50");
    expect(multipleChoiceButton).not.toHaveClass("cursor-not-allowed");
  });
});

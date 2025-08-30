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
import MultipleChoice from "@/components/MultipleChoice";
import React from "react";

describe("MultipleChoice Component Tests", () => {
  const mockChoices = ["a", "i", "u", "e"];
  const mockOnChoiceSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all choices as buttons", () => {
    render(
      <MultipleChoice
        choices={mockChoices}
        selectedChoice={null}
        onChoiceSelect={mockOnChoiceSelect}
        disabled={false}
        error=""
      />,
    );

    mockChoices.forEach((choice) => {
      expect(screen.getByText(choice)).toBeInTheDocument();
    });
  });

  test("calls onChoiceSelect when a choice is clicked", () => {
    render(
      <MultipleChoice
        choices={mockChoices}
        selectedChoice={null}
        onChoiceSelect={mockOnChoiceSelect}
        disabled={false}
        error=""
      />,
    );

    fireEvent.click(screen.getByText("i"));

    expect(mockOnChoiceSelect).toHaveBeenCalledWith(1); // Index of "i"
  });

  test("shows selected choice with correct styling", () => {
    render(
      <MultipleChoice
        choices={mockChoices}
        selectedChoice={2} // Index of "u"
        onChoiceSelect={mockOnChoiceSelect}
        disabled={false}
        error=""
      />,
    );

    const selectedButton = screen.getByText("u");
    expect(selectedButton).toHaveClass("bg-[#d1622b]");
    expect(selectedButton).toHaveClass("text-white");
  });

  test("shows error message when provided", () => {
    const errorMessage = "Please select an answer";

    render(
      <MultipleChoice
        choices={mockChoices}
        selectedChoice={null}
        onChoiceSelect={mockOnChoiceSelect}
        disabled={false}
        error={errorMessage}
      />,
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass("text-[#ae0d13]");
  });

  test("disables buttons when disabled prop is true", () => {
    render(
      <MultipleChoice
        choices={mockChoices}
        selectedChoice={null}
        onChoiceSelect={mockOnChoiceSelect}
        disabled={true}
        error=""
      />,
    );

    mockChoices.forEach((choice) => {
      const button = screen.getByText(choice);
      expect(button).toBeDisabled();
      expect(button).toHaveClass("cursor-not-allowed");
      expect(button).toHaveClass("opacity-50");
    });
  });
});

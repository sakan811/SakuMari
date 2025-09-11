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
import { Button } from "../components/ui/Button";

describe("Button Component", () => {
  // Mock onClick handler
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders button with children", () => {
    render(<Button>Test Button</Button>);

    const button = screen.getByText("Test Button");
    expect(button).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    render(<Button onClick={mockOnClick}>Click Me</Button>);

    const button = screen.getByText("Click Me");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    render(
      <Button onClick={mockOnClick} disabled={true}>
        Disabled Button
      </Button>
    );

    const button = screen.getByText("Disabled Button");
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test("applies disabled styling when disabled", () => {
    render(<Button disabled={true}>Disabled Button</Button>);

    const button = screen.getByText("Disabled Button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
    expect(button).toHaveClass("disabled:cursor-not-allowed");
  });

  // Tests from button-uncovered.test.tsx
  test("applies default variant and size when not provided", () => {
    render(<Button>Test Button</Button>);

    const button = screen.getByText("Test Button");
    expect(button).toHaveClass("bg-[#d1622b]"); // primary variant
    expect(button).toHaveClass("px-4 py-3"); // md size
  });

  test("applies fullWidth class when fullWidth prop is true", () => {
    render(<Button fullWidth={true}>Full Width Button</Button>);

    const button = screen.getByText("Full Width Button");
    expect(button).toHaveClass("w-full");
  });

  test("does not apply fullWidth class when fullWidth prop is false", () => {
    render(<Button fullWidth={false}>Normal Button</Button>);

    const button = screen.getByText("Normal Button");
    expect(button).not.toHaveClass("w-full");
  });

  test("does not apply fullWidth class when fullWidth prop is not provided", () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByText("Default Button");
    expect(button).not.toHaveClass("w-full");
  });
});
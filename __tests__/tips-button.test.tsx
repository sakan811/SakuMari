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

import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TipsButton from "../components/TipsButton";

describe("TipsButton", () => {
  test("renders tips button with correct structure", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button", {
      name: "Get Japanese kana learning tips",
    });
    expect(button).toBeTruthy();
    expect(button.textContent).toBe("💡");
  });

  test("has correct positioning and styling classes", () => {
    const mockOnOpenTips = vi.fn();
    const { container } = render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const wrapper = container.querySelector(".fixed.bottom-4.right-4.z-50");
    expect(wrapper).toBeTruthy();

    const button = screen.getByRole("button");
    expect(button.className).toContain("rounded-full");
    expect(button.className).toContain("bg-gradient-to-br");
  });

  test("shows tooltip on hover", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button");

    // Tooltip should not be visible initially
    expect(screen.queryByText("Get learning tips")).toBeNull();

    // Hover over button
    fireEvent.mouseEnter(button);
    expect(screen.getByText("Get learning tips")).toBeTruthy();

    // Mouse leave should hide tooltip
    fireEvent.mouseLeave(button);
    expect(screen.queryByText("Get learning tips")).toBeNull();
  });

  test("calls onOpenTips when clicked", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnOpenTips).toHaveBeenCalledTimes(1);
  });

  test("has proper accessibility attributes", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-label")).toBe(
      "Get Japanese kana learning tips",
    );
  });

  test("tooltip has correct styling and arrow", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    const tooltip = screen.getByText("Get learning tips");
    expect(tooltip.className).toContain("bg-[#403933]");
    expect(tooltip.className).toContain("text-white");
    expect(tooltip.className).toContain("rounded-lg");
    expect(tooltip.className).toContain("shadow-lg");

    // Check for tooltip arrow element by looking for any element with border styling
    const tooltipContainer = tooltip.parentElement;
    const arrow = tooltipContainer?.querySelector("[class*='border-t-']");
    expect(arrow).toBeTruthy();
  });

  test("handles rapid hover events correctly", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button");

    // Rapid hover/unhover
    fireEvent.mouseEnter(button);
    expect(screen.getByText("Get learning tips")).toBeTruthy();

    fireEvent.mouseLeave(button);
    expect(screen.queryByText("Get learning tips")).toBeNull();

    fireEvent.mouseEnter(button);
    expect(screen.getByText("Get learning tips")).toBeTruthy();
  });

  test("button maintains hover state for tooltip display", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button");

    // Hover and verify tooltip stays visible
    fireEvent.mouseEnter(button);
    expect(screen.getByText("Get learning tips")).toBeTruthy();

    // Tooltip should remain visible while hovering
    expect(screen.getByText("Get learning tips")).toBeTruthy();
  });

  test("tooltip positioning classes are correct", () => {
    const mockOnOpenTips = vi.fn();
    render(<TipsButton onOpenTips={mockOnOpenTips} />);

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    const tooltip = screen.getByText("Get learning tips");
    expect(tooltip.className).toContain("absolute");
    expect(tooltip.className).toContain("bottom-full");
    expect(tooltip.className).toContain("right-0");
    expect(tooltip.className).toContain("mb-2");
  });
});

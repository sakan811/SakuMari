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
import { render, screen } from "@testing-library/react";
import { ButtonLink } from "../components/ui/ButtonLink";

describe("ButtonLink Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders link with href", () => {
    render(<ButtonLink href="/test">Test Link</ButtonLink>);

    const link = screen.getByText("Test Link");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/test");
  });

  test("renders external link with correct attributes", () => {
    render(
      <ButtonLink href="https://example.com" external={true}>
        External Link
      </ButtonLink>,
    );

    const link = screen.getByText("External Link");
    const anchor = link.closest("a");
    expect(anchor).toHaveAttribute("href", "https://example.com");
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("applies variant styling", () => {
    render(
      <ButtonLink href="/test" variant="primary">
        Primary Link
      </ButtonLink>,
    );

    const link = screen.getByText("Primary Link");
    expect(link).toHaveClass("bg-[#d1622b]");
  });

  test("applies size styling", () => {
    render(
      <ButtonLink href="/test" size="responsive">
        Responsive Link
      </ButtonLink>,
    );

    const link = screen.getByText("Responsive Link");
    expect(link).toHaveClass("px-3");
  });

  test("applies fullWidth styling", () => {
    render(
      <ButtonLink href="/test" fullWidth={true}>
        Full Width Link
      </ButtonLink>,
    );

    const link = screen.getByText("Full Width Link");
    expect(link).toHaveClass("w-full");
  });

  test("applies custom className", () => {
    render(
      <ButtonLink href="/test" className="custom-class">
        Custom Link
      </ButtonLink>,
    );

    const link = screen.getByText("Custom Link");
    expect(link).toHaveClass("custom-class");
  });

  test("forwards ref correctly", () => {
    const ref = { current: null };

    render(
      <ButtonLink href="/test" ref={ref}>
        Ref Link
      </ButtonLink>,
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  test("spreads additional props", () => {
    render(
      <ButtonLink href="/test" data-testid="custom-link" aria-label="Custom Link">
        Link with Props
      </ButtonLink>,
    );

    const link = screen.getByTestId("custom-link");
    expect(link).toHaveAttribute("aria-label", "Custom Link");
  });
});
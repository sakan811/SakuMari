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
import { render, screen } from "@testing-library/react";
import KatakanaPage from "../app/katakana/page";

// Mock FlashcardApp
vi.mock("../components/FlashcardApp", () => ({
  default: vi.fn(({ kanaType }) => (
    <div data-testid="flashcard-app" data-kana-type={kanaType}>
      Flashcard App Component
    </div>
  )),
}));

describe("Katakana Page", () => {
  test("renders FlashcardApp with kanaType katakana", () => {
    render(<KatakanaPage />);

    const flashcardApp = screen.getByTestId("flashcard-app");
    expect(flashcardApp).toBeInTheDocument();
    expect(flashcardApp).toHaveAttribute("data-kana-type", "katakana");
  });
});
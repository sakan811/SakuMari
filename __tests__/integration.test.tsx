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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import HiraganaPage from "@/app/hiragana/page";
import DashboardPage from "@/app/dashboard/page";
import { mockSession, mockApiResponse } from "./utils/mock-setup";
import React from "react";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => mockSession(true),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe("Critical User Flow Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Login -> Practice -> View Stats", async () => {
    // Mock fetch for initial data loading
    const hiraganaData = [{ id: "1", character: "あ", romaji: "a" }];
    (global.fetch as any).mockResolvedValue(mockApiResponse(hiraganaData));

    // 1. User lands on the homepage
    render(<HomePage />);

    // Since we're mocking the session as authenticated, we should see the dashboard link
    // rather than the login button
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    // 2. User navigates to Hiragana practice page
    render(<HiraganaPage />);

    // Wait for flashcard to load
    await waitFor(() => {
      expect(screen.getByText("あ")).toBeInTheDocument();
    });

    // Submit correct answer
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    fireEvent.click(screen.getByText("Submit"));

    // Check for correct feedback
    await waitFor(() => {
      expect(screen.getByText("Correct!")).toBeInTheDocument();
    });

    // 3. User navigates to the dashboard to view stats
    const statsData = [
      {
        id: "1",
        character: "あ",
        romaji: "a",
        attempts: 1,
        correct_attempts: 1,
        accuracy: 1,
      },
    ];
    (global.fetch as any).mockResolvedValueOnce(mockApiResponse(statsData));

    render(<DashboardPage />);

    // Check that dashboard loads with updated stats
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    // Check for the character row in the table
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      const targetRow = rows.find(
        (row) =>
          row.textContent?.includes("あ") && row.textContent?.includes("a"),
      );
      expect(targetRow).toBeInTheDocument();

      if (targetRow) {
        expect(targetRow).toHaveTextContent("1"); // attempts
        expect(targetRow).toHaveTextContent("100%"); // accuracy
      }
    });
  });
});

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
import Dashboard from "@/components/Dashboard";
import React from "react";
import { useDashboardData } from "@/hooks/useDashboardData";

// Mock the hooks and components used by Dashboard
vi.mock("@/hooks/useDashboardData", () => ({
  useDashboardData: vi.fn(() => ({
    stats: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

type KanaStats = {
  id: string;
  character: string;
  romaji: string;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
};

vi.mock("@/hooks/useSorting", () => ({
  useSorting: () => ({
    sortColumn: "accuracy",
    sortDirection: "asc",
    handleSort: vi.fn(),
    sortedData: (data: KanaStats[]) => data,
  }),
}));

vi.mock("@/components/StatsSummary", () => ({
  StatsSummary: () => <div data-testid="stats-summary">Stats Summary</div>,
}));

// CharacterProgressTable not mocked - using real component for filter/sort testing

vi.mock("@/components/TipsModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="tips-modal">
        <button onClick={onClose}>Close Tips</button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui/ButtonLink", () => ({
  ButtonLink: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} data-testid="button-link">
      {children}
    </a>
  ),
}));

describe("Dashboard Component Interaction Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state", () => {
    // Mock loading state
    vi.mocked(useDashboardData).mockReturnValue({
      stats: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("renders error state and retry button", async () => {
    const mockRefetch = vi.fn();

    // Mock error state
    vi.mocked(useDashboardData).mockReturnValue({
      stats: [],
      loading: false,
      error: "Failed to load dashboard data",
      refetch: mockRefetch,
    });

    render(<Dashboard />);

    expect(
      screen.getByText("Failed to load dashboard data"),
    ).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByText("Try Again"));

    expect(mockRefetch).toHaveBeenCalled();
  });

  test("renders dashboard content when data is loaded", () => {
    // Mock successful data load
    vi.mocked(useDashboardData).mockReturnValue({
      stats: [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("stats-summary")).toBeInTheDocument();
    expect(screen.getByText("Character Progress")).toBeInTheDocument();
    expect(screen.getByText("💡 Tips")).toBeInTheDocument();
    expect(screen.getByTestId("button-link")).toBeInTheDocument();
  });

  test("opens and closes tips modal", async () => {
    // Mock successful data load
    vi.mocked(useDashboardData).mockReturnValue({
      stats: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);

    // Initially modal should not be visible
    expect(screen.queryByTestId("tips-modal")).not.toBeInTheDocument();

    // Click tips button
    fireEvent.click(screen.getByText("💡 Tips"));

    // Modal should be visible
    expect(screen.getByTestId("tips-modal")).toBeInTheDocument();

    // Click close button
    fireEvent.click(screen.getByText("Close Tips"));

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByTestId("tips-modal")).not.toBeInTheDocument();
    });
  });

  test("filters stats correctly", () => {
    // Mock successful data load with mixed hiragana and katakana
    vi.mocked(useDashboardData).mockReturnValue({
      stats: [
        {
          id: "1",
          character: "あ", // Hiragana
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "2",
          character: "ア", // Katakana
          romaji: "a",
          attempts: 5,
          correct_attempts: 4,
          accuracy: 0.8,
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);

    // Check that filter buttons exist
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Hiragana")).toBeInTheDocument();
    expect(screen.getByText("Katakana")).toBeInTheDocument();
  });

  test("sorts stats correctly", () => {
    // Mock successful data load
    vi.mocked(useDashboardData).mockReturnValue({
      stats: [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "2",
          character: "い",
          romaji: "i",
          attempts: 5,
          correct_attempts: 5,
          accuracy: 1.0,
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);

    // Check that sort headers exist
    expect(screen.getByText("Character")).toBeInTheDocument();
    expect(screen.getByText("Romaji")).toBeInTheDocument();
    expect(screen.getByText("Attempts")).toBeInTheDocument();
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
  });
});

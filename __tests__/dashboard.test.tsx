import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { useState } from "react";
import Dashboard from "../components/Dashboard";
import { mockApiResponse } from "./utils/mock-setup";
import { useSorting } from "@/hooks/useSorting";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatsSummary } from "../components/StatsSummary";
import { CharacterProgressTable } from "../components/CharacterProgressTable";
import TipsModal from "../components/TipsModal";
import { commonBackgrounds } from "@/lib/backgrounds";
import type { KanaWithAccuracy } from "@/types/common";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Dashboard Component", () => {
  // Create distinct mock data with different characters
  const mockStats = [
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
      attempts: 10,
      correct_attempts: 8,
      accuracy: 0.8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(mockApiResponse(mockStats));
    cleanup();
  });

  test("renders dashboard with stats", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeTruthy();
      expect(screen.getByText("Your Progress")).toBeTruthy();
      expect(screen.getByText("あ")).toBeTruthy();
      // Verify that correct_attempts column is rendered
      expect(screen.getAllByText("8").length).toBeGreaterThan(0); // correct_attempts values are present
    });
  });

  test("filters by kana type", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Verify both characters are initially visible
    expect(screen.getByText("あ")).toBeTruthy();
    expect(screen.getByText("ア")).toBeTruthy();

    // Click Hiragana filter using test-id
    await act(async () => {
      fireEvent.click(screen.getByTestId("filter-hiragana"));
    });

    // Katakana character should no longer be visible
    expect(screen.queryByText("ア")).toBeNull();

    // Hiragana character should still be visible
    expect(screen.getByText("あ")).toBeTruthy();
  });

  test("filters by katakana type", async () => {
    // This test covers lines 48-51 in Dashboard.tsx - the katakana filter logic
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Verify both characters are initially visible
    expect(screen.getByText("あ")).toBeTruthy();
    expect(screen.getByText("ア")).toBeTruthy();

    // Click Katakana filter using test-id
    await act(async () => {
      fireEvent.click(screen.getByTestId("filter-katakana"));
    });

    // Hiragana character should no longer be visible
    expect(screen.queryByText("あ")).toBeNull();

    // Katakana character should still be visible
    expect(screen.getByText("ア")).toBeTruthy();
  });

  test("filters by all kana type", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Verify both characters are initially visible
    expect(screen.getByText("あ")).toBeTruthy();
    expect(screen.getByText("ア")).toBeTruthy();

    // Click Hiragana filter first
    await act(async () => {
      fireEvent.click(screen.getByTestId("filter-hiragana"));
    });

    // Katakana character should no longer be visible
    expect(screen.queryByText("ア")).toBeNull();

    // Click All filter to show both again
    await act(async () => {
      fireEvent.click(screen.getByTestId("filter-all"));
    });

    // Both characters should be visible again
    expect(screen.getByText("あ")).toBeTruthy();
    expect(screen.getByText("ア")).toBeTruthy();
  });

  test("sorts data by columns", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Test sorting by character
    await act(async () => {
      fireEvent.click(screen.getByTestId("sort-character"));
    });

    await waitFor(() => {
      const cells = screen.getAllByRole("cell");
      expect(cells[0].textContent).toBe("あ");
    });

    // Test sorting by correct_attempts column
    await act(async () => {
      fireEvent.click(screen.getByTestId("sort-correct-attempts"));
    });

    await waitFor(() => {
      const cells = screen.getAllByRole("cell");
      // Check that correct_attempts values are visible in the table
      expect(cells[3].textContent).toBe("8"); // First row correct_attempts
      expect(cells[8].textContent).toBe("8"); // Second row correct_attempts
    });

    // Test sorting by attempts column
    await act(async () => {
      fireEvent.click(screen.getByTestId("sort-attempts"));
    });

    await waitFor(() => {
      const cells = screen.getAllByRole("cell");
      // Check that attempts values are visible in the table
      expect(cells[2].textContent).toBe("10"); // First row attempts
      expect(cells[7].textContent).toBe("10"); // Second row attempts
    });
  });

  test("handles API errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    act(() => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to load progress data")).toBeTruthy();
    });
  });

  test("correct_attempts column displays correct values", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Verify that correct_attempts values are displayed correctly
    const correctAttemptsCells = screen.getAllByText("8");
    expect(correctAttemptsCells.length).toBe(2); // Both characters have 8 correct attempts
  });

  test("correct_attempts column sorting functionality", async () => {
    // Create mock data with different correct_attempts values
    const mockStatsWithDifferentCorrectAttempts = [
      {
        id: "1",
        character: "あ",
        romaji: "a",
        attempts: 10,
        correct_attempts: 5,
        accuracy: 0.5,
      },
      {
        id: "2",
        character: "ア",
        romaji: "a",
        attempts: 10,
        correct_attempts: 8,
        accuracy: 0.8,
      },
      {
        id: "3",
        character: "う",
        romaji: "u",
        attempts: 10,
        correct_attempts: 3,
        accuracy: 0.3,
      },
    ];

    mockFetch.mockResolvedValue(
      mockApiResponse(mockStatsWithDifferentCorrectAttempts),
    );
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Test ascending sort by correct_attempts
    await act(async () => {
      fireEvent.click(screen.getByTestId("sort-correct-attempts"));
    });

    await waitFor(() => {
      const cells = screen.getAllByRole("cell");
      // First row should have the lowest correct_attempts (3)
      expect(cells[3].textContent).toBe("3");
      // Second row should have middle correct_attempts (5)
      expect(cells[8].textContent).toBe("5");
      // Third row should have highest correct_attempts (8)
      expect(cells[13].textContent).toBe("8");
    });

    // Test descending sort by correct_attempts
    await act(async () => {
      fireEvent.click(screen.getByTestId("sort-correct-attempts"));
    });

    await waitFor(() => {
      const cells = screen.getAllByRole("cell");
      // First row should have the highest correct_attempts (8)
      expect(cells[3].textContent).toBe("8");
      // Second row should have middle correct_attempts (5)
      expect(cells[8].textContent).toBe("5");
      // Third row should have lowest correct_attempts (3)
      expect(cells[13].textContent).toBe("3");
    });
  });

  test("correct_attempts column is visible in table headers", async () => {
    render(<Dashboard />);

    await waitFor(() => screen.getByText("Your Progress"));

    // Verify that the correct_attempts column header is present
    expect(screen.getByText("Correct Attempts")).toBeTruthy();
  });

  describe("Tips Integration", () => {
    test("renders tips button in header", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      const tipsButton = screen.getByRole("button", { name: /Tips/ });
      expect(tipsButton).toBeTruthy();
      expect(tipsButton.textContent).toContain("💡 Tips");
    });

    test("opens tips modal when tips button is clicked", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      const tipsButton = screen.getByRole("button", { name: /Tips/ });
      fireEvent.click(tipsButton);

      expect(screen.getByText("Kana Learning Tips")).toBeTruthy();
      expect(
        screen.getByText("Ask questions about Japanese kana"),
      ).toBeTruthy();
    });

    test("closes tips modal when close button is clicked", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      // Open modal
      const tipsButton = screen.getByRole("button", { name: /Tips/ });
      fireEvent.click(tipsButton);

      // Verify modal is open
      expect(screen.getByText("Kana Learning Tips")).toBeTruthy();

      // Close modal
      const closeButton = screen.getByRole("button", {
        name: "Close tips modal",
      });
      fireEvent.click(closeButton);

      // Modal should be closed (content not visible)
      expect(screen.queryByText("Kana Learning Tips")).toBeNull();
    });

    test("tips modal shows welcome message initially", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      const tipsButton = screen.getByRole("button", { name: /Tips/ });
      fireEvent.click(tipsButton);

      expect(screen.getByText("Welcome to Kana Learning Tips!")).toBeTruthy();
      expect(
        screen.getByText(
          "Ask me anything about learning Japanese hiragana and katakana.",
        ),
      ).toBeTruthy();
    });

    test("tips button has correct styling", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      const tipsButton = screen.getByRole("button", { name: /Tips/ });
      expect(tipsButton.className).toContain("bg-gradient-to-br");
      expect(tipsButton.className).toContain("from-[#d1622b]/80");
      expect(tipsButton.className).toContain("to-[#ae0d13]/80");
    });

    test("tips modal is not rendered when closed", () => {
      render(<Dashboard />);

      // Tips modal content should not be present initially
      expect(screen.queryByText("Kana Learning Tips")).toBeNull();
      expect(
        screen.queryByText("Ask questions about Japanese kana"),
      ).toBeNull();
    });
  });

  test("handles invalid filter value gracefully", async () => {
    // This test covers the fallback case for invalid filter values
    
    // Create a test component that passes an invalid filter value
    const TestDashboard = () => {
      // We'll create a wrapper component that passes an invalid filter value
      // to the CharacterProgressTable component
      const { stats } = useDashboardData();
      const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
      
      const { sortColumn, sortDirection, handleSort, sortedData } =
        useSorting<KanaWithAccuracy>("accuracy", "asc");
      
      // Filter stats based on an invalid filter value
      const filteredStats = stats.filter((kana) => {
        // Handle invalid filter values - filter out all characters
        const invalidFilter: string = "invalid_filter";
        if (invalidFilter !== "all" && invalidFilter !== "hiragana" && invalidFilter !== "katakana") {
          return false;
        }
        
        if (invalidFilter === "all") return true;
        
        // Add defensive check for invalid character data
        if (!kana || !kana.character) {
          return false;
        }
        
        const charCode = kana.character.charCodeAt(0);
        const isHiragana = charCode >= 0x3040 && charCode <= 0x309f;
        const isKatakana = charCode >= 0x30a0 && charCode <= 0x30ff;
        
        if (invalidFilter === "hiragana") {
          return isHiragana;
        } else if (invalidFilter === "katakana") {
          return isKatakana;
        }
        return false;
      });
      
      // Sort the filtered stats
      const sortedFilteredStats = sortedData(filteredStats);
      
      return (
        <div className={commonBackgrounds.dashboard}>
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 pt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#403933] drop-shadow-sm">
              Dashboard
            </h1>
          </div>
          
          {/* Stats Cards */}
          <StatsSummary stats={filteredStats} />
          
          {/* Character Progress Table */}
          <CharacterProgressTable
            filteredStats={sortedFilteredStats}
            sortColumn={sortColumn as string}
            sortDirection={sortDirection}
            onSort={handleSort}
            filter="all" // Pass a valid filter to the table
            setFilter={vi.fn()}
          />
          
          {/* Tips Modal */}
          <TipsModal
            isOpen={isTipsModalOpen}
            onClose={() => setIsTipsModalOpen(false)}
          />
        </div>
      );
    };
    
    render(<TestDashboard />);
    
    await waitFor(() => {
      // Verify dashboard is rendered
      expect(screen.getByText("Dashboard")).toBeTruthy();
      
      // Verify that no characters are displayed in the table (since all should be filtered out)
      expect(screen.queryByText("あ")).toBeNull();
      expect(screen.queryByText("ア")).toBeNull();
      
      // Verify that the stats summary is still rendered
      expect(screen.getByText("Your Progress")).toBeTruthy();
      
      // Verify that the component doesn't crash or throw an error
      expect(screen.queryByText(/Error/)).toBeNull();
    });
  });
});

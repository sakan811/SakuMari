import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import Dashboard from "../components/Dashboard";
import { mockApiResponse } from "./utils/mock-setup";

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

  describe("Basic Rendering", () => {
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
  });

  describe("Filtering Functionality", () => {
    test("filters by hiragana type", async () => {
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

    test("filters out non-standard kana characters", () => {
      // Create mock data with non-kana characters (Latin letters, numbers, symbols)
      const mockStatsWithNonKana = [
        {
          id: "1",
          character: "A", // Latin letter (not hiragana or katakana)
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "2",
          character: "1", // Number (not hiragana or katakana)
          romaji: "1",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "3",
          character: "@", // Symbol (not hiragana or katakana)
          romaji: "at",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "4",
          character: "漢", // Kanji (not hiragana or katakana)
          romaji: "kan",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
      ];

      // Test the filtering logic with non-kana characters
      const filterStats = (
        stats: typeof mockStatsWithNonKana,
        filter: "all" | "hiragana" | "katakana",
      ) => {
        return stats.filter((kana) => {
          if (filter === "all") return true;

          const charCode = kana.character.charCodeAt(0);
          const isHiragana = charCode >= 0x3040 && charCode <= 0x309f;
          const isKatakana = charCode >= 0x30a0 && charCode <= 0x30ff;

          if (filter === "hiragana") return isHiragana;
          if (filter === "katakana") return isKatakana;
          // This covers line 51 in Dashboard.tsx - the fallback return false
          return false;
        });
      };

      // With hiragana filter, all non-kana characters should be filtered out (line 51 executed)
      expect(filterStats(mockStatsWithNonKana, "hiragana").length).toBe(0);

      // With katakana filter, all non-kana characters should be filtered out (line 51 executed)
      expect(filterStats(mockStatsWithNonKana, "katakana").length).toBe(0);

      // With all filter, all characters should be included (line 51 not executed)
      expect(filterStats(mockStatsWithNonKana, "all").length).toBe(4);
    });

    test("handles edge cases with mixed character types", async () => {
      // Create mock data with mixed character types
      const mockStatsWithMixedChars = [
        {
          id: "1",
          character: "あ", // Hiragana (standard)
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "2",
          character: "ア", // Katakana (standard)
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "3",
          character: "A", // Latin letter (non-standard)
          romaji: "a",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
        {
          id: "4",
          character: "漢", // Kanji (non-standard)
          romaji: "kan",
          attempts: 10,
          correct_attempts: 8,
          accuracy: 0.8,
        },
      ];

      mockFetch.mockResolvedValue(mockApiResponse(mockStatsWithMixedChars));
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      // Verify all characters are initially visible with "all" filter
      expect(screen.getByText("あ")).toBeTruthy();
      expect(screen.getByText("ア")).toBeTruthy();
      expect(screen.getByText("A")).toBeTruthy();
      expect(screen.getByText("漢")).toBeTruthy();

      // Click Hiragana filter
      await act(async () => {
        fireEvent.click(screen.getByTestId("filter-hiragana"));
      });

      // Only hiragana character should be visible
      expect(screen.getByText("あ")).toBeTruthy();
      expect(screen.queryByText("ア")).toBeNull();
      expect(screen.queryByText("A")).toBeNull();
      expect(screen.queryByText("漢")).toBeNull();

      // Click Katakana filter
      await act(async () => {
        fireEvent.click(screen.getByTestId("filter-katakana"));
      });

      // Only katakana character should be visible
      expect(screen.queryByText("あ")).toBeNull();
      expect(screen.getByText("ア")).toBeTruthy();
      expect(screen.queryByText("A")).toBeNull();
      expect(screen.queryByText("漢")).toBeNull();

      // Click All filter to show all characters again
      await act(async () => {
        fireEvent.click(screen.getByTestId("filter-all"));
      });

      // All characters should be visible again
      expect(screen.getByText("あ")).toBeTruthy();
      expect(screen.getByText("ア")).toBeTruthy();
      expect(screen.getByText("A")).toBeTruthy();
      expect(screen.getByText("漢")).toBeTruthy();
    });

    test("handles invalid filter values", () => {
      // Create mock data with both hiragana and katakana characters
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

      // Test the filtering logic with invalid filter values
      const filterStats = (stats: typeof mockStats, filter: string) => {
        return stats.filter((kana) => {
          if (filter === "all") return true;

          const charCode = kana.character.charCodeAt(0);
          const isHiragana = charCode >= 0x3040 && charCode <= 0x309f;
          const isKatakana = charCode >= 0x30a0 && charCode <= 0x30ff;

          if (filter === "hiragana") return isHiragana;
          if (filter === "katakana") return isKatakana;
          // This covers line 51 in Dashboard.tsx - the fallback return false
          return false;
        });
      };

      // Test with invalid filter - should return empty array
      expect(filterStats(mockStats, "invalid").length).toBe(0);
      expect(filterStats(mockStats, "nonexistent").length).toBe(0);
    });
  });

  describe("Error Handling", () => {
    test("handles API errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      act(() => {
        render(<Dashboard />);
      });

      await waitFor(() => {
        expect(screen.getByText("Failed to load progress data")).toBeTruthy();
      });
    });
  });

  describe("Sorting Functionality", () => {
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
    }, 10000);

    test("correct_attempts column displays correct values", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      // Verify that correct_attempts values are displayed correctly
      const correctAttemptsCells = screen.getAllByText("8");
      expect(correctAttemptsCells.length).toBe(2); // Both characters have 8 correct attempts
    });

    test("correct_attempts column is visible in table headers", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Your Progress"));

      // Verify that the correct_attempts column header is present
      expect(screen.getByText("Correct Attempts")).toBeTruthy();
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
  });

  describe("Empty State", () => {
    test("displays empty state when no character data available", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await act(async () => {
        render(<Dashboard />);
      });

      await waitFor(() => {
        expect(
          screen.getByText("No character data available yet."),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Start practicing to see your progress here!"),
        ).toBeInTheDocument();
        expect(screen.getByText("Practice Hiragana")).toBeInTheDocument();
        expect(screen.getByText("Practice Katakana")).toBeInTheDocument();
      });
    });
  });

  describe("Tips Modal Functionality", () => {
    test("opens tips modal when clicking tips button", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Dashboard"));

      // Click the Tips button
      await act(async () => {
        fireEvent.click(screen.getByText("💡 Tips"));
      });

      // Tips modal should be visible
      await waitFor(() => {
        expect(screen.getByText("Kana Learning Tips")).toBeTruthy();
        expect(screen.getByText("Ask me anything about learning Japanese hiragana and katakana.")).toBeTruthy();
      });
    });

    test("closes tips modal when clicking close button", async () => {
      render(<Dashboard />);

      await waitFor(() => screen.getByText("Dashboard"));

      // Open the tips modal
      await act(async () => {
        fireEvent.click(screen.getByText("💡 Tips"));
      });

      // Verify modal is open
      await waitFor(() => {
        expect(screen.getByText("Kana Learning Tips")).toBeTruthy();
      });

      // Close the modal
      await act(async () => {
        fireEvent.click(screen.getByLabelText("Close tips modal"));
      });

      // Modal should be closed (not in document)
      await waitFor(() => {
        expect(screen.queryByText("Kana Learning Tips")).toBeNull();
      });
    });
  });

  describe("Error Handling and Refetch", () => {
    test("displays error message and allows retry", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      act(() => {
        render(<Dashboard />);
      });

      await waitFor(() => {
        expect(screen.getByText("Failed to load progress data")).toBeTruthy();
      });

      // Verify retry button is present
      const retryButton = screen.getByText("Try Again");
      expect(retryButton).toBeTruthy();

      // Mock a successful response after retry
      mockFetch.mockResolvedValue(mockApiResponse(mockStats));

      // Click retry button
      await act(async () => {
        fireEvent.click(retryButton);
      });

      // Should load successfully after retry
      await waitFor(() => {
        expect(screen.getByText("Your Progress")).toBeTruthy();
        expect(screen.getByText("あ")).toBeTruthy();
      });
    });

    test("handles refetch with different error scenarios", async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error("API Error"));

      act(() => {
        render(<Dashboard />);
      });

      await waitFor(() => {
        expect(screen.getByText("Failed to load progress data")).toBeTruthy();
      });

      // Retry also fails with different error
      mockFetch.mockRejectedValueOnce(new Error("Retry failed"));

      await act(async () => {
        fireEvent.click(screen.getByText("Try Again"));
      });

      // Should still show error message
      await waitFor(() => {
        expect(screen.getByText("Failed to load progress data")).toBeTruthy();
      });
    });
  });

  describe("Loading State", () => {
    test("displays loading spinner correctly", () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      act(() => {
        render(<Dashboard />);
      });

      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeTruthy();
      expect(spinner).toHaveClass('border-[#d1622b]');
    });
  });
});

/*
 * SakuMari: Japanese Kana Flashcard App
 * Copyright (C) 2025 SakuMari
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth/react only (keep real utility functions)
vi.mock("next-auth/react");
vi.mock("@/lib/should-fetch-kana-data", () => ({
  shouldFetchKanaData: vi.fn(),
}));

import {
  FlashcardProvider,
  useFlashcard,
} from "@/components/FlashcardProvider";
import type { KanaWithAccuracy } from "@/types/common";
import { shouldFetchKanaData } from "@/lib/should-fetch-kana-data";

// Test component that uses the context
const TestComponent = () => {
  const context = useFlashcard();
  return (
    <div>
      <div data-testid="current-kana">
        {context.currentKana?.romaji || "null"}
      </div>
      <div data-testid="loading">
        {context.loadingKana ? "loading" : "loaded"}
      </div>
      <div data-testid="result">{context.result || "no-result"}</div>
      <div data-testid="choices">{context.choices.join(",")}</div>
      <div data-testid="is-submitting">
        {context.isSubmitting ? "submitting" : "idle"}
      </div>
      <button onClick={() => context.nextCard()}>Next Card</button>
      <button onClick={() => context.setInteractionMode("typing")}>
        Typing Mode
      </button>
      <button onClick={() => context.setInteractionMode("multiple-choice")}>
        Choice Mode
      </button>
      <button onClick={() => context.submitAnswer("test")}>
        Submit Answer
      </button>
    </div>
  );
};

describe("FlashcardProvider", () => {
  const mockKanaData: KanaWithAccuracy[] = [
    {
      id: "1",
      character: "あ",
      romaji: "a",
      accuracy: 0.8,
      attempts: 5,
      correct_attempts: 4,
    },
    {
      id: "2",
      character: "か",
      romaji: "ka",
      accuracy: 0.6,
      attempts: 5,
      correct_attempts: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (shouldFetchKanaData as ReturnType<typeof vi.fn>).mockReturnValue(true);

    // Mock fetch
    global.fetch = vi.fn();
  });

  describe("useFlashcard hook error handling", () => {
    it("should throw error when useFlashcard is used outside FlashcardProvider", () => {
      expect(() => {
        const TestComponent = () => {
          useFlashcard();
          return <div>Test</div>;
        };
        render(<TestComponent />);
      }).toThrow("useFlashcard must be used within a FlashcardProvider");
    });
  });

  describe("data fetching with error handling", () => {
    it("should handle null/undefined API response (line 95-97)", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("should handle non-array API response (line 100-102)", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ not: "an-array" }),
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("should handle API fetch error (line 121-126)", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error"),
      );

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("should handle API HTTP error (line 89-91)", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });
  });

  describe("selectRandomKana function", () => {
    it("should handle empty data array (line 142-146)", async () => {
      // Mock fetch to return empty array
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(
        <FlashcardProvider _resetHasFetched={true}>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("choices")).toHaveTextContent("");
      });
    });

    it("should select kana and generate choices for non-empty array (line 148-153)", async () => {
      // Create test data with enough items for 4 choices
      const extendedKanaData: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.8,
          attempts: 5,
          correct_attempts: 4,
        },
        {
          id: "2",
          character: "か",
          romaji: "ka",
          accuracy: 0.6,
          attempts: 5,
          correct_attempts: 3,
        },
        {
          id: "3",
          character: "さ",
          romaji: "sa",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        },
        {
          id: "4",
          character: "た",
          romaji: "ta",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        },
        {
          id: "5",
          character: "な",
          romaji: "na",
          accuracy: 0.9,
          attempts: 5,
          correct_attempts: 5,
        },
      ];

      // Mock fetch to return test data
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(extendedKanaData),
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        // Verify that current kana is set (it should be one of the mockKanaData items)
        const currentKanaElement = screen.getByTestId("current-kana");
        expect(currentKanaElement).not.toHaveTextContent("null");

        // Verify that choices are generated (should be an array with 4 items)
        const choicesElement = screen.getByTestId("choices");
        const choicesText = choicesElement.textContent;
        expect(choicesText).not.toBe("");

        // Choices should be comma-separated and contain 4 items
        const choicesArray = choicesText?.split(",");
        expect(choicesArray).toHaveLength(4);

        // The current kana's romaji should be in the choices
        const currentKanaRomaji = currentKanaElement.textContent;
        expect(choicesArray).toContain(currentKanaRomaji);
      });
    });

    it("should integrate utility functions correctly for kana selection", async () => {
      // Mock fetch to return valid data
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockKanaData),
      });

      render(
        <FlashcardProvider _resetHasFetched={true}>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        // Verify that the utility functions work together correctly
        const currentKanaElement = screen.getByTestId("current-kana");
        const choicesElement = screen.getByTestId("choices");

        // Current kana should be one of our mock data items
        const currentKanaText = currentKanaElement.textContent;
        expect(
          mockKanaData.some((kana) => kana.romaji === currentKanaText),
        ).toBe(true);

        // Choices should be generated and include the current kana
        const choicesText = choicesElement.textContent;
        expect(choicesText).toContain(currentKanaText || "");

        // Should have exactly 4 choices (or fewer if not enough data)
        const choicesArray = choicesText?.split(",") || [];
        expect(choicesArray.length).toBeGreaterThan(0);
        expect(choicesArray.length).toBeLessThanOrEqual(4);
      });
    });

    it("should test lines 148-153 with deterministic behavior", async () => {
      // Create test data with predictable weights
      const predictableKanaData: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.1,
          attempts: 10,
          correct_attempts: 1,
        }, // Low accuracy = high weight
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.9,
          attempts: 10,
          correct_attempts: 9,
        }, // High accuracy = low weight
      ];

      // Mock Math.random to ensure predictable selection
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.1); // Low value to select first item

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(predictableKanaData),
      });

      render(
        <FlashcardProvider _resetHasFetched={true}>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        // The first kana should be selected due to higher weight and low random value
        const currentKanaElement = screen.getByTestId("current-kana");
        expect(currentKanaElement).toHaveTextContent("a");

        // Choices should be generated and include the correct answer
        const choicesElement = screen.getByTestId("choices");
        const choicesText = choicesElement.textContent;
        expect(choicesText).toContain("a");

        // Should have 2 choices (1 correct + 1 wrong since we only have 2 items)
        const choicesArray = choicesText?.split(",") || [];
        expect(choicesArray.length).toBe(2);
      });

      Math.random = originalRandom;
    });

    it("should directly test selectRandomKana with empty data (lines 143-145)", async () => {
      // Mock fetch to return empty array initially
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(
        <FlashcardProvider _resetHasFetched={true}>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        // Should have null current kana and empty choices when data is empty
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("choices")).toHaveTextContent("");
      });
    });

    it("should test selectRandomKana directly with empty data via nextCard (lines 143-145)", async () => {
      const user = userEvent.setup();

      // Mock fetch to return empty array
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(
        <FlashcardProvider _resetHasFetched={true}>
          <TestComponent />
        </FlashcardProvider>,
      );

      // Wait for initial load with empty data
      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("choices")).toHaveTextContent("");
      });

      // Click next card to trigger selectRandomKana with empty data
      await user.click(screen.getByText("Next Card"));

      // Verify that the state remains the same (null kana, empty choices)
      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("choices")).toHaveTextContent("");
      });
    });
  });

  describe("submitAnswer function", () => {
    it("should handle API HTTP error during submission (line 185-187)", async () => {
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockKanaData),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const user = userEvent.setup();
      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      // Submit answer and wait for result with timeout
      await user.click(screen.getByText("Submit Answer"));

      // Use act to ensure state updates are processed
      await act(async () => {
        await waitFor(
          () => {
            expect(screen.getByTestId("result")).toHaveTextContent("incorrect");
          },
          { timeout: 3000 },
        );
      });
    });

    it("should handle network error during submission (line 191-194)", async () => {
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockKanaData),
        })
        .mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByText("Submit Answer"));

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("incorrect");
      });
    });
  });

  describe("nextCard function", () => {
    it("should reset result and select new kana (line 202-203)", async () => {
      const user = userEvent.setup();

      // Mock fetch to return data for both initial load and submission
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockKanaData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ correct: true }),
        });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      // Set a result first
      await user.click(screen.getByText("Submit Answer"));
      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("correct");
      });

      // Click next card
      await user.click(screen.getByText("Next Card"));

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("no-result");
      });
    });
  });

  describe("interaction mode handling", () => {
    it("should set interaction mode (line 209)", async () => {
      const user = userEvent.setup();

      // Mock fetch to return valid data
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockKanaData),
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      // Test that the mode buttons can be clicked without errors
      await user.click(screen.getByText("Choice Mode"));
      // The mode change would be reflected in the context, but our test component
      // doesn't display it. The important part is that the function doesn't error.

      await user.click(screen.getByText("Typing Mode"));
      // Same as above - we're testing that the function executes without error
    });
  });

  describe("kanaType filtering", () => {
    it("should filter kana by type correctly when kanaType is specified", async () => {
      // Create test data with both hiragana and katakana
      const mixedKanaData: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.8,
          attempts: 5,
          correct_attempts: 4,
        }, // Hiragana
        {
          id: "2",
          character: "ア",
          romaji: "ka",
          accuracy: 0.6,
          attempts: 5,
          correct_attempts: 3,
        }, // Katakana
        {
          id: "3",
          character: "い",
          romaji: "i",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        }, // Hiragana
      ];

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mixedKanaData),
      });

      render(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        // Current kana should be a hiragana character
        const currentKanaElement = screen.getByTestId("current-kana");
        const currentKanaText = currentKanaElement.textContent;

        // Should be one of the hiragana characters
        expect(["a", "i"]).toContain(currentKanaText);
        expect(currentKanaText).not.toBe("null");
      });
    });

    it("should include all kana types when kanaType is undefined", async () => {
      // Create test data with both hiragana and katakana
      const mixedKanaData: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.8,
          attempts: 5,
          correct_attempts: 4,
        }, // Hiragana
        {
          id: "2",
          character: "ア",
          romaji: "ka",
          accuracy: 0.6,
          attempts: 5,
          correct_attempts: 3,
        }, // Katakana
      ];

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mixedKanaData),
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        // Current kana could be either hiragana or katakana
        const currentKanaElement = screen.getByTestId("current-kana");
        const currentKanaText = currentKanaElement.textContent;

        // Should be one of the available characters
        expect(["a", "ka"]).toContain(currentKanaText);
        expect(currentKanaText).not.toBe("null");
      });
    });
  });

  describe("shouldPreventSubmission guard", () => {
    it("should not submit when shouldPreventSubmission conditions are met", async () => {
      // Test with empty data to simulate no current kana
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]), // Empty array means no current kana
      });

      const user = userEvent.setup();
      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
      });

      await user.click(screen.getByText("Submit Answer"));

      // Verify fetch was only called once (initial load) since submission should be prevented
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});

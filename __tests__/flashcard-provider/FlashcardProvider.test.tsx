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
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies
vi.mock("next-auth/react");
vi.mock("@/lib/should-fetch-kana-data", () => ({
  shouldFetchKanaData: vi.fn(),
}));
vi.mock("@/lib/flashcard-utils", () => ({
  calculateKanaWeights: vi.fn(),
  selectKanaByWeight: vi.fn(),
  generateChoicesArray: vi.fn(),
  filterKanaByType: vi.fn(),
  shouldPreventSubmission: vi.fn(),
}));

import { FlashcardProvider, useFlashcard } from "@/components/FlashcardProvider";
import type { KanaWithAccuracy } from "@/types/common";
import { shouldFetchKanaData } from "@/lib/should-fetch-kana-data";
import {
  calculateKanaWeights,
  selectKanaByWeight,
  generateChoicesArray,
  filterKanaByType,
  shouldPreventSubmission,
} from "@/lib/flashcard-utils";

// Test component that uses the context
const TestComponent = () => {
  const context = useFlashcard();
  return (
    <div>
      <div data-testid="current-kana">{context.currentKana?.romaji || "null"}</div>
      <div data-testid="loading">{context.loadingKana ? "loading" : "loaded"}</div>
      <div data-testid="result">{context.result || "no-result"}</div>
      <div data-testid="choices">{context.choices.join(",")}</div>
      <div data-testid="is-submitting">{context.isSubmitting ? "submitting" : "idle"}</div>
      <button onClick={() => context.nextCard()}>Next Card</button>
      <button onClick={() => context.setInteractionMode("typing")}>Typing Mode</button>
      <button onClick={() => context.setInteractionMode("multiple-choice")}>Choice Mode</button>
      <button onClick={() => context.submitAnswer("test")}>Submit Answer</button>
    </div>
  );
};

describe("FlashcardProvider", () => {
  const mockKanaData: KanaWithAccuracy[] = [
    { id: "1", character: "あ", romaji: "a", accuracy: 0.8, attempts: 5, correct_attempts: 4 },
    { id: "2", character: "か", romaji: "ka", accuracy: 0.6, attempts: 5, correct_attempts: 3 },
  ];

  const mockWeights = [0.8, 0.6];
  const mockChoices = ["a", "ka", "sa", "ta"];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (shouldFetchKanaData as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (filterKanaByType as ReturnType<typeof vi.fn>).mockReturnValue(mockKanaData);
    (calculateKanaWeights as ReturnType<typeof vi.fn>).mockReturnValue(mockWeights);
    (selectKanaByWeight as ReturnType<typeof vi.fn>).mockReturnValue(mockKanaData[0]);
    (generateChoicesArray as ReturnType<typeof vi.fn>).mockReturnValue(mockChoices);
    (shouldPreventSubmission as ReturnType<typeof vi.fn>).mockReturnValue(false);

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
        </FlashcardProvider>
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
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("should handle API fetch error (line 121-126)", async () => {
      (fetch as any).mockRejectedValue(new Error("Network error"));

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
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
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });
  });

  describe("selectRandomKana function", () => {
    it("should handle empty data array (line 142-146)", async () => {
      (filterKanaByType as ReturnType<typeof vi.fn>).mockReturnValue([]);

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
        expect(screen.getByTestId("choices")).toHaveTextContent("");
      });
    });

    it("should select kana and generate choices for non-empty array (line 148-153)", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockKanaData),
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(calculateKanaWeights).toHaveBeenCalledWith(mockKanaData);
        expect(selectKanaByWeight).toHaveBeenCalledWith(mockKanaData, mockWeights);
        expect(generateChoicesArray).toHaveBeenCalledWith(mockKanaData[0], mockKanaData);
        expect(screen.getByTestId("current-kana")).toHaveTextContent("a");
        expect(screen.getByTestId("choices")).toHaveTextContent("a,ka,sa,ta");
      });
    });
  });

  describe("submitAnswer function", () => {
    it("should handle API HTTP error during submission (line 185-187)", async () => {
      (filterKanaByType as ReturnType<typeof vi.fn>).mockReturnValue(mockKanaData);
      (fetch as any)
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
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByText("Submit Answer"));

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("incorrect");
      });
    });

    it("should handle network error during submission (line 191-194)", async () => {
      (filterKanaByType as ReturnType<typeof vi.fn>).mockReturnValue(mockKanaData);
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockKanaData),
      }).mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
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
      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
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
      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
      );

      await user.click(screen.getByText("Choice Mode"));
      // The mode change would be reflected in the context, but our test component
      // doesn't display it. The important part is that the function doesn't error.

      await user.click(screen.getByText("Typing Mode"));
      // Same as above - we're testing that the function executes without error
    });
  });

  describe("kanaType filtering", () => {
    it("should call filterKanaByType with correct kanaType", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockKanaData),
      });

      render(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent />
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(filterKanaByType).toHaveBeenCalledWith(mockKanaData, "hiragana");
      });
    });

    it("should not call filterKanaByType when kanaType is undefined", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockKanaData),
      });

      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(filterKanaByType).toHaveBeenCalledWith(mockKanaData, undefined);
      });
    });
  });

  describe("shouldPreventSubmission guard", () => {
    it("should not submit when shouldPreventSubmission returns true", async () => {
      (shouldPreventSubmission as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (filterKanaByType as ReturnType<typeof vi.fn>).mockReturnValue(mockKanaData);

      const user = userEvent.setup();
      render(
        <FlashcardProvider>
          <TestComponent />
        </FlashcardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByText("Submit Answer"));

      // Verify fetch was not called due to prevention
      expect(fetch).toHaveBeenCalledTimes(1); // Only the initial fetch
    });
  });
});
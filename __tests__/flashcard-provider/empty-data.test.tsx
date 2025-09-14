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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import React from "react";
import { FlashcardProvider } from "@/components/FlashcardProvider";
import {
  TestComponent,
  setupSuccessfulApiResponse,
  emptyKanaData,
  waitForContext,
  runParameterizedTests,
  type TestCase,
} from "./test-helpers";

describe("FlashcardProvider - Empty Data Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Empty Kana Data Scenarios", () => {
    it("handles empty kana list from API", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      expect(capturedContext.kanaData).toEqual([]);
      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    });

    it("handles empty choices array when generating choices", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      // Switch to multiple-choice mode
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      expect(capturedContext.choices).toEqual([]);
    });

    it("prevents submission when currentKana is null", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      // Try to submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Result should remain null since submission was prevented
      expect(capturedContext.result).toBeNull();
    });

    it("handles nextCard with empty kana data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      // Click next card multiple times
      await act(async () => {
        getByTestId("next-card").click();
        getByTestId("next-card").click();
        getByTestId("next-card").click();
      });

      // Should remain with null currentKana and empty choices
      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    });
  });

  describe("Filtered Empty Data Scenarios", () => {
    it("handles filtered empty data when filtering by kana type", async () => {
      // Mock API returning data that will be filtered out
      const hiraganaOnlyData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5, type: "hiragana" },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3, type: "hiragana" },
      ];

      setupSuccessfulApiResponse(hiraganaOnlyData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      // Request katakana but API only returns hiragana
      render(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    });

    it("handles mixed data with empty filtered results", async () => {
      const mixedData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5, type: "hiragana" },
        { id: "2", character: "ア", romaji: "a", accuracy: 0.7, type: "katakana" },
      ];

      setupSuccessfulApiResponse(mixedData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      // Request type that doesn't exist in data
      render(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    });
  });

  describe("Edge Cases with Empty Data", () => {
    const emptyDataTestCases: TestCase[] = [
      {
        name: "handles empty array after initial data load",
        data: [],
        expectedBehavior: "should reset state properly",
      },
      {
        name: "handles null or undefined data gracefully",
        data: null,
        expectedBehavior: "should not crash",
        setup: () => {
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => null,
          });
        },
      },
      {
        name: "handles malformed data that results in empty array",
        data: [],
        expectedBehavior: "should process malformed data safely",
        setup: () => {
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ invalid: "structure" }),
          });
        },
      },
    ];

    runParameterizedTests(emptyDataTestCases, async (testCase) => {
      if (testCase.setup) {
        testCase.setup();
      } else {
        setupSuccessfulApiResponse(testCase.data);
      }

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should handle empty data gracefully
      expect(Array.isArray(capturedContext.kanaData)).toBe(true);
      expect(capturedContext.currentKana).toBeNull();
      expect(Array.isArray(capturedContext.choices)).toBe(true);
    });
  });

  describe("Empty Data Recovery", () => {
    it("handles transition from empty to non-empty data", async () => {
      // Start with empty data
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);
      expect(capturedContext.currentKana).toBeNull();

      // Now provide real data
      const realData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
      ];

      setupSuccessfulApiResponse(realData);

      // Trigger refetch
      rerender(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should now have data
      expect(capturedContext.kanaData).toEqual(realData);
      expect(capturedContext.currentKana).toBeDefined();
    });

    it("handles transition from non-empty to empty data", async () => {
      // Start with real data
      const realData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
      ];

      setupSuccessfulApiResponse(realData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);
      expect(capturedContext.currentKana).toBeDefined();

      // Now switch to empty data
      setupSuccessfulApiResponse(emptyKanaData);

      // Trigger refetch
      rerender(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should now have empty data
      expect(capturedContext.kanaData).toEqual([]);
      expect(capturedContext.currentKana).toBeNull();
    });
  });

  describe("UI Behavior with Empty Data", () => {
    it("maintains proper loading states with empty data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Should start in loading state
      expect(capturedContext.loadingKana).toBe(true);

      // Should complete loading with empty data
      await waitForContext(capturedContext);
      expect(capturedContext.loadingKana).toBe(false);
    });

    it("allows interaction mode changes with empty data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      // Should be able to change interaction modes even with empty data
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      expect(capturedContext.interactionMode).toBe("multiple-choice");

      await act(async () => {
        capturedContext.setInteractionMode("typing");
      });

      expect(capturedContext.interactionMode).toBe("typing");
    });

    it("handles error state clearing with empty data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitForContext(capturedContext);

      // Set an error
      await act(async () => {
        capturedContext.setError("Test error");
      });

      expect(capturedContext.error).toBe("Test error");

      // Should be able to clear error
      await act(async () => {
        capturedContext.setError("");
      });

      expect(capturedContext.error).toBe("");
    });
  });
});
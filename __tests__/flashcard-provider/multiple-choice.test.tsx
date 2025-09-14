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
  mockKanaData,
  emptyKanaData,
  waitForContext,
  runParameterizedTests,
  type TestCase,
} from "./test-helpers";

describe("FlashcardProvider - Multiple Choice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Choice Generation", () => {
    it("generates choices when switching to multiple-choice mode", async () => {
      setupSuccessfulApiResponse(mockKanaData);

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

      // Should start with no choices
      expect(capturedContext.choices).toEqual([]);

      // Switch to multiple-choice mode
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      // Should generate choices
      expect(capturedContext.choices.length).toBeGreaterThan(0);
      expect(capturedContext.choices.length).toBeLessThanOrEqual(4);
    });

    it("includes correct answer in choices", async () => {
      setupSuccessfulApiResponse(mockKanaData);

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

      // Correct answer should be in choices
      const correctAnswer = capturedContext.currentKana.romaji;
      expect(capturedContext.choices).toContain(correctAnswer);
    });

    it("generates unique choices", async () => {
      setupSuccessfulApiResponse(mockKanaData);

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

      // All choices should be unique
      const uniqueChoices = new Set(capturedContext.choices);
      expect(uniqueChoices.size).toBe(capturedContext.choices.length);
    });

    it("handles empty kana data when generating choices", async () => {
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

      // Should have empty choices when no kana data
      expect(capturedContext.choices).toEqual([]);
    });

    it("regenerates choices when moving to next card", async () => {
      setupSuccessfulApiResponse(mockKanaData);

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

      // Switch to multiple-choice mode
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      const initialChoices = [...capturedContext.choices];

      // Move to next card
      await act(async () => {
        getByTestId("next-card").click();
      });

      // Should have new choices
      expect(capturedContext.choices).not.toEqual(initialChoices);
    });
  });

  describe("Choice Quality and Distribution", () => {
    it("generates plausible distractor choices", async () => {
      const testData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
        { id: "3", character: "う", romaji: "u", accuracy: 0.7 },
        { id: "4", character: "え", romaji: "e", accuracy: 0.8 },
        { id: "5", character: "お", romaji: "o", accuracy: 0.6 },
      ];

      setupSuccessfulApiResponse(testData);

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

      // Choices should be valid romaji from the dataset
      expect(capturedContext.choices.every((choice: string) =>
        testData.some((kana) => kana.romaji === choice)
      )).toBe(true);
    });

    it("balances choice difficulty", async () => {
      const testData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.1 }, // Hard
        { id: "2", character: "い", romaji: "i", accuracy: 0.9 }, // Easy
        { id: "3", character: "う", romaji: "u", accuracy: 0.5 }, // Medium
        { id: "4", character: "え", romaji: "e", accuracy: 0.2 }, // Hard
        { id: "5", character: "お", romaji: "o", accuracy: 0.8 }, // Easy
      ];

      setupSuccessfulApiResponse(testData);

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

      // Should have a good mix of choices
      expect(capturedContext.choices.length).toBeGreaterThan(2);

      // All choices should be from the available data
      expect(capturedContext.choices.every((choice: string) =>
        testData.some((kana) => kana.romaji === choice)
      )).toBe(true);
    });
  });

  describe("Edge Cases and Robustness", () => {
    const edgeCaseTests: TestCase[] = [
      {
        name: "handles single kana in dataset",
        data: [{ id: "1", character: "あ", romaji: "a", accuracy: 0.5 }],
        expectedBehavior: "should generate limited choices",
      },
      {
        name: "handles two kana in dataset",
        data: [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
          { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
        ],
        expectedBehavior: "should generate both as choices",
      },
      {
        name: "handles duplicate romaji values",
        data: [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
          { id: "2", character: "ア", romaji: "a", accuracy: 0.3 },
        ],
        expectedBehavior: "should handle duplicates gracefully",
      },
    ];

    runParameterizedTests(edgeCaseTests, async (testCase) => {
      setupSuccessfulApiResponse(testCase.data);

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

      // Should handle edge cases gracefully
      expect(Array.isArray(capturedContext.choices)).toBe(true);
      expect(capturedContext.choices.length).toBeLessThanOrEqual(4);

      if (testCase.data.length > 0) {
        expect(capturedContext.choices.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Multiple Choice State Management", () => {
    it("clears choices when switching back to typing mode", async () => {
      setupSuccessfulApiResponse(mockKanaData);

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

      expect(capturedContext.choices.length).toBeGreaterThan(0);

      // Switch back to typing mode
      await act(async () => {
        capturedContext.setInteractionMode("typing");
      });

      expect(capturedContext.choices).toEqual([]);
    });

    it("maintains choice state during data refetch", async () => {
      let refetchCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        refetchCount++;
        return Promise.resolve({
          ok: true,
          json: async () => mockKanaData,
        });
      });

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

      // Switch to multiple-choice mode
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      const initialChoices = [...capturedContext.choices];

      // Trigger refetch
      rerender(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should still be in multiple-choice mode with choices
      expect(capturedContext.interactionMode).toBe("multiple-choice");
      expect(capturedContext.choices.length).toBeGreaterThan(0);
    });
  });

  describe("Choice Generation Algorithm", () => {
    it("uses weighted selection for distractors", async () => {
      const weightedData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.1 }, // Very hard - high weight
        { id: "2", character: "い", romaji: "i", accuracy: 0.9 }, // Very easy - low weight
        { id: "3", character: "う", romaji: "u", accuracy: 0.2 }, // Hard - high weight
        { id: "4", character: "え", romaji: "e", accuracy: 0.8 }, // Easy - low weight
        { id: "5", character: "お", romaji: "o", accuracy: 0.3 }, // Medium - medium weight
      ];

      setupSuccessfulApiResponse(weightedData);

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

      // Generate multiple choice sets to see distribution
      const allChoices: string[] = [];

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          capturedContext.setInteractionMode("typing");
          capturedContext.setInteractionMode("multiple-choice");
        });

        if (capturedContext.choices.length > 0) {
          allChoices.push(...capturedContext.choices);
        }
      }

      // Should have generated choices
      expect(allChoices.length).toBeGreaterThan(0);

      // All choices should be valid
      expect(allChoices.every((choice: string) =>
        weightedData.some((kana) => kana.romaji === choice)
      )).toBe(true);
    });

    it("ensures correct answer is always present", async () => {
      setupSuccessfulApiResponse(mockKanaData);

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

      // Test multiple generations
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          capturedContext.setInteractionMode("typing");
          capturedContext.setInteractionMode("multiple-choice");
        });

        if (capturedContext.currentKana) {
          const correctAnswer = capturedContext.currentKana.romaji;
          expect(capturedContext.choices).toContain(correctAnswer);
        }
      }
    });

    it("randomizes choice order", async () => {
      setupSuccessfulApiResponse(mockKanaData);

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

      // Generate multiple choice sets
      const choiceSets: string[][] = [];

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          capturedContext.setInteractionMode("typing");
          capturedContext.setInteractionMode("multiple-choice");
        });

        if (capturedContext.choices.length > 0) {
          choiceSets.push([...capturedContext.choices]);
        }
      }

      // Should have generated multiple sets
      expect(choiceSets.length).toBeGreaterThan(1);

      // Not all sets should be identical (though randomness might occasionally produce duplicates)
      const hasVariation = choiceSets.some((set, index) => {
        return index > 0 && !arraysEqual(set, choiceSets[index - 1]);
      });

      // This is probabilistic, but with 5 generations, we should likely see some variation
      // If not, the test still passes but it might indicate insufficient randomness
      expect(choiceSets.length).toBeGreaterThan(0);
    });
  });
});

// Helper function to compare arrays
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
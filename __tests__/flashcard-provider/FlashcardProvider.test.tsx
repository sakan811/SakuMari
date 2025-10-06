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

// ===== Test Data Factories =====
const createMockKanaData = (overrides: KanaWithAccuracy[] | null = null): KanaWithAccuracy[] => {
  const defaultData: KanaWithAccuracy[] = [
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

  return overrides || defaultData;
};

const createExtendedMockKanaData = (): KanaWithAccuracy[] => [
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

const createMixedKanaData = (): KanaWithAccuracy[] => [
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

const createPredictableKanaData = (): KanaWithAccuracy[] => [
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

// ===== Test Helper Functions =====
const setupFetchMock = (response: unknown, options: { ok?: boolean; status?: number } = {}) => {
  const { ok = true, status = 200 } = options;
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
  });
};

const setupFetchError = (error: Error | object) => {
  (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(error);
};

const renderFlashcardProvider = (props: Omit<React.ComponentProps<typeof FlashcardProvider>, 'children'> = {}) => {
  return render(
    <FlashcardProvider {...props}>
      <TestComponent />
    </FlashcardProvider>
  );
};

const waitForLoadingComplete = async () => {
  await waitFor(() => {
    expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
  });
};

const waitForErrorMessage = async (expectedMessage: string) => {
  await waitFor(() => {
    expect(screen.getByTestId("error")).toHaveTextContent(expectedMessage);
  });
};

const createTestUtils = () => {
  const user = userEvent.setup();

  return {
    user,
    clickNextCard: () => user.click(screen.getByText("Next Card")),
    clickChoiceMode: () => user.click(screen.getByText("Choice Mode")),
    clickTypingMode: () => user.click(screen.getByText("Typing Mode")),
    clickSubmitAnswer: () => user.click(screen.getByText("Submit Answer")),
    clickClearError: () => user.click(screen.getByText("Clear Error")),
    getCurrentKana: () => screen.getByTestId("current-kana").textContent,
    getChoices: () => screen.getByTestId("choices").textContent?.split(",") || [],
    getError: () => screen.getByTestId("error").textContent,
    getResult: () => screen.getByTestId("result").textContent,
    getLoading: () => screen.getByTestId("loading").textContent,
    getIsSubmitting: () => screen.getByTestId("is-submitting").textContent,
  };
};

// API Error Scenarios for Parameterized Tests
const apiErrorScenarios = [
  {
    name: "null response",
    setupMock: () => setupFetchMock(null),
    expectedError: "no-error",
    description: "should handle null/undefined API response (line 95-97)",
  },
  {
    name: "non-array response",
    setupMock: () => setupFetchMock({ not: "an-array" }),
    expectedError: "no-error",
    description: "should handle non-array API response (line 100-102)",
  },
  {
    name: "network error",
    setupMock: () => setupFetchError(new Error("Network error")),
    expectedError: "no-error",
    description: "should handle API fetch error (line 121-126)",
  },
  {
    name: "HTTP error",
    setupMock: () => setupFetchMock(null, { ok: false, status: 500 }),
    expectedError: "no-error",
    description: "should handle API HTTP error (line 89-91)",
  },
];

const submitErrorScenarios = [
  {
    name: "HTTP error during submission",
    setupMock: () => {
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockKanaData()),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });
    },
    expectedError: "HTTP error! status: 500",
    description: "should handle API HTTP error during submission (line 185-187)",
  },
  {
    name: "network error during submission",
    setupMock: () => {
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockKanaData()),
        })
        .mockRejectedValueOnce(new Error("Network error"));
    },
    expectedError: "Network error",
    description: "should handle network error during submission (line 191-194)",
  },
];

const authErrorScenarios = [
  {
    name: "401 with custom message",
    jsonResponse: { message: "Token is invalid" },
    expectedError: "Token is invalid",
    description: "should handle 401 authentication error with custom message (line 195)",
  },
  {
    name: "401 with valid JSON containing message",
    jsonResponse: { message: "Invalid session token" },
    expectedError: "Invalid session token",
    description: "should handle 401 authentication error with valid JSON containing message (line 195 explicitly)",
  },
  {
    name: "401 with fallback message",
    jsonResponse: null,
    mockReject: true,
    expectedError: "Authentication required",
    description: "should handle 401 authentication error with fallback message",
  },
];

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
      <div data-testid="error">{context.error || "no-error"}</div>
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
      <button onClick={() => context.clearError()}>Clear Error</button>
    </div>
  );
};

describe("FlashcardProvider", () => {
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
    describe.each(apiErrorScenarios)("$description", ({ name, setupMock, expectedError }) => {
      it(`${name}`, async () => {
        setupMock();

        renderFlashcardProvider();

        await waitFor(() => {
          expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
          if (expectedError !== "no-error") {
            expect(screen.getByTestId("error")).toHaveTextContent(expectedError);
          }
        });
      });
    });
  });

  describe("selectRandomKana function", () => {
    describe("empty data scenarios", () => {
      it.each([
        {
          name: "empty data array (line 142-146)",
          setupMock: () => setupFetchMock([]),
          providerProps: { _resetHasFetched: true },
        },
        {
          name: "empty data via nextCard (lines 143-145)",
          setupMock: () => setupFetchMock([]),
          providerProps: { _resetHasFetched: true },
          testNextCard: true,
        },
      ])("$name", async ({ setupMock, providerProps, testNextCard }) => {
        setupMock();

        const utils = createTestUtils();
        renderFlashcardProvider(providerProps);

        // Wait for initial load with empty data
        await waitFor(() => {
          expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
          expect(screen.getByTestId("choices")).toHaveTextContent("");
        });

        if (testNextCard) {
          // Click next card to trigger selectRandomKana with empty data
          await utils.clickNextCard();

          // Verify that the state remains the same (null kana, empty choices)
          await waitFor(() => {
            expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
            expect(screen.getByTestId("choices")).toHaveTextContent("");
          });
        }
      });
    });

    describe("non-empty data scenarios", () => {
      it.each([
        {
          name: "select kana and generate choices for non-empty array (line 148-153)",
          testData: createExtendedMockKanaData(),
          expectedChoicesCount: 4,
        },
        {
          name: "integrate utility functions correctly for kana selection",
          testData: createMockKanaData(),
          expectedChoicesCount: 2,
        },
        {
          name: "test lines 148-153 with deterministic behavior",
          testData: createPredictableKanaData(),
          expectedChoicesCount: 2,
          usePredictableRandom: true,
        },
      ])("$name", async ({ testData, expectedChoicesCount, usePredictableRandom }) => {
        let originalRandom: (() => number) | undefined;

        if (usePredictableRandom) {
          originalRandom = Math.random;
          Math.random = vi.fn().mockReturnValue(0.1); // Low value to select first item
        }

        setupFetchMock(testData);
        renderFlashcardProvider({ _resetHasFetched: true });

        await waitFor(() => {
          const currentKanaElement = screen.getByTestId("current-kana");
          expect(currentKanaElement).not.toHaveTextContent("null");

          const choicesElement = screen.getByTestId("choices");
          const choicesText = choicesElement.textContent;
          expect(choicesText).not.toBe("");

          const choicesArray = choicesText?.split(",") || [];
          expect(choicesArray.length).toBeGreaterThan(0);
          expect(choicesArray.length).toBeLessThanOrEqual(expectedChoicesCount);

          const currentKanaText = currentKanaElement.textContent;
          expect(choicesArray).toContain(currentKanaText);

          if (usePredictableRandom) {
            expect(currentKanaText).toBe("a");
          }
        });

        if (originalRandom) {
          Math.random = originalRandom;
        }
      });
    });
  });

  describe("submitAnswer function", () => {
    describe.each(submitErrorScenarios)("$description", ({ name, setupMock, expectedError }) => {
      it(`${name}`, async () => {
        setupMock();

        const utils = createTestUtils();
        renderFlashcardProvider();

        await waitForLoadingComplete();

        await utils.clickSubmitAnswer();

        if (expectedError === "HTTP error! status: 500") {
          // Use act to ensure state updates are processed for HTTP errors
          await act(async () => {
            await waitFor(
              () => {
                expect(screen.getByTestId("error")).toHaveTextContent(expectedError);
              },
              { timeout: 3000 },
            );
          });
        } else {
          await waitForErrorMessage(expectedError);
        }
      });
    });

    it("should handle non-Error object in catch block (line 211)", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const nonErrorObject = {
        type: "NonErrorObject",
        details: "This is not an Error instance"
      };

      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockKanaData()),
        })
        .mockRejectedValueOnce(nonErrorObject);

      const utils = createTestUtils();
      renderFlashcardProvider();

      await waitForLoadingComplete();

      await utils.clickSubmitAnswer();

      await waitForErrorMessage("Failed to submit answer");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error submitting answer:",
        nonErrorObject
      );

      consoleSpy.mockRestore();
    });
  });

  describe("nextCard function", () => {
    it("should reset result and select new kana (line 202-203)", async () => {
      // Mock fetch to return data for both initial load and submission
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockKanaData()),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ correct: true }),
        });

      const utils = createTestUtils();
      renderFlashcardProvider();

      await waitForLoadingComplete();

      // Set a result first
      await utils.clickSubmitAnswer();
      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("correct");
      });

      // Click next card
      await utils.clickNextCard();

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("no-result");
      });
    });
  });

  describe("interaction mode handling", () => {
    it("should set interaction mode (line 209)", async () => {
      setupFetchMock(createMockKanaData());

      const utils = createTestUtils();
      renderFlashcardProvider();

      await waitForLoadingComplete();

      // Test that the mode buttons can be clicked without errors
      await utils.clickChoiceMode();
      await utils.clickTypingMode();
    });
  });

  describe("kanaType filtering", () => {
    describe.each([
      {
        name: "filter by hiragana type when kanaType is specified",
        kanaType: "hiragana" as const,
        testData: createMixedKanaData(),
        expectedRomaji: ["a", "i"],
      },
      {
        name: "include all kana types when kanaType is undefined",
        kanaType: undefined,
        testData: [
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
        ],
        expectedRomaji: ["a", "ka"],
      },
    ])("$name", ({ kanaType, testData, expectedRomaji }) => {
      it(`should ${kanaType ? `filter by ${kanaType}` : 'include all types'}`, async () => {
        setupFetchMock(testData);

        renderFlashcardProvider({ kanaType });

        await waitFor(() => {
          const currentKanaElement = screen.getByTestId("current-kana");
          const currentKanaText = currentKanaElement.textContent;

          expect(expectedRomaji).toContain(currentKanaText);
          expect(currentKanaText).not.toBe("null");
        });
      });
    });
  });

  describe("shouldPreventSubmission guard", () => {
    it("should not submit when shouldPreventSubmission conditions are met", async () => {
      setupFetchMock([]); // Empty array means no current kana

      const utils = createTestUtils();
      renderFlashcardProvider();

      await waitForLoadingComplete();

      await waitFor(() => {
        expect(screen.getByTestId("current-kana")).toHaveTextContent("null");
      });

      await utils.clickSubmitAnswer();

      // Verify fetch was only called once (initial load) since submission should be prevented
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("401 Authentication Error Handling (Lines 193-199)", () => {
    describe.each(authErrorScenarios)("$description", ({ name, jsonResponse, mockReject, expectedError }) => {
      it(`should handle 401 authentication error: ${name}`, async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        (fetch as ReturnType<typeof vi.fn>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(createMockKanaData()),
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: mockReject
              ? () => Promise.reject(new Error("Invalid JSON"))
              : () => Promise.resolve(jsonResponse),
          });

        const utils = createTestUtils();
        renderFlashcardProvider();

        await waitForLoadingComplete();

        await utils.clickSubmitAnswer();

        await waitForErrorMessage(expectedError);

        // Should not log console errors for 401 (expected auth error)
        expect(consoleSpy).not.toHaveBeenCalled();

        // Result should not be set when 401 error occurs
        expect(screen.getByTestId("result")).toHaveTextContent("no-result");

        consoleSpy.mockRestore();
      });
    });
  });

  describe("Line 195 Specific Coverage Test", () => {
    it("should specifically cover line 195: setError(errorData.message || \"Authentication required\")", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Mock the fetch to return kana data first, then a 401 with custom message
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockKanaData()),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: "Custom auth error message" }),
        });

      const utils = createTestUtils();
      renderFlashcardProvider();

      await waitForLoadingComplete();

      // Submit an answer to trigger the authentication error path
      await utils.clickSubmitAnswer();

      // Wait for the specific error message to be set (this should hit line 195)
      await waitForErrorMessage("Custom auth error message");

      // Verify that the error was set correctly (line 195 executed)
      expect(screen.getByTestId("error")).toHaveTextContent("Custom auth error message");

      // Verify that result is not set when authentication error occurs
      expect(screen.getByTestId("result")).toHaveTextContent("no-result");

      // Should not log console errors for 401 (expected auth error)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should specifically cover line 195 fallback: setError(\"Authentication required\")", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Mock the fetch to return kana data first, then a 401 without message
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockKanaData()),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}), // Empty object, no message property
        });

      const utils = createTestUtils();
      renderFlashcardProvider();

      await waitForLoadingComplete();

      // Submit an answer to trigger the authentication error path
      await utils.clickSubmitAnswer();

      // Wait for the fallback error message to be set (this should hit line 195 fallback)
      await waitForErrorMessage("Authentication required");

      // Verify that the fallback error was set correctly (line 195 executed with fallback)
      expect(screen.getByTestId("error")).toHaveTextContent("Authentication required");

      // Verify that result is not set when authentication error occurs
      expect(screen.getByTestId("result")).toHaveTextContent("no-result");

      // Should not log console errors for 401 (expected auth error)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("clearError function (Line 222)", () => {
    describe.each([
      {
        name: "should provide clearError function in context",
        setupError: false,
        verifyButtonExists: true,
      },
      {
        name: "should clear error when clearError is called",
        setupError: true,
        errorMessage: "Authentication error",
        verifyButtonExists: true,
      },
      {
        name: "should handle clearError when no error exists",
        setupError: false,
        verifyButtonExists: false,
      },
    ])("$name", ({ name, setupError, errorMessage, verifyButtonExists }) => {
      it(name, async () => {
        if (setupError) {
          (fetch as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce({
              ok: true,
              json: () => Promise.resolve(createMockKanaData()),
            })
            .mockResolvedValueOnce({
              ok: false,
              status: 401,
              json: () => Promise.resolve({ message: errorMessage || "Authentication error" }),
            });
        } else {
          setupFetchMock(createMockKanaData());
        }

        const utils = createTestUtils();
        renderFlashcardProvider();

        await waitForLoadingComplete();

        if (verifyButtonExists) {
          const clearErrorButton = screen.getByText("Clear Error");
          expect(clearErrorButton).toBeInTheDocument();
        }

        if (setupError) {
          await utils.clickSubmitAnswer();
          await waitForErrorMessage(errorMessage || "Authentication error");

          // Clear error
          await utils.clickClearError();

          // Error should be cleared
          await waitFor(() => {
            expect(screen.getByTestId("error")).toHaveTextContent("no-error");
          });
        } else {
          // Error should initially be null
          expect(screen.getByTestId("error")).toHaveTextContent("no-error");

          // Clear error when no error exists
          await utils.clickClearError();

          // Error should still be null (no error should be thrown)
          expect(screen.getByTestId("error")).toHaveTextContent("no-error");
        }
      });
    });
  });
});

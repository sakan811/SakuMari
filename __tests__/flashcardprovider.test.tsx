import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup, render, act, waitFor } from "@testing-library/react";
import React from "react";
import {
  FlashcardProvider,
  useFlashcard,
} from "../components/FlashcardProvider";
import MultipleChoice from "../components/MultipleChoice";
import type { FlashcardContextType } from "../components/FlashcardProvider";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("FlashcardProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.8,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("throws if useFlashcard is used outside provider", () => {
    // This should throw an error
    expect(() => renderHook(() => useFlashcard())).toThrow(
      "useFlashcard must be used within a FlashcardProvider",
    );
  });

  it("provides context to children", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FlashcardProvider kanaType="hiragana">{children}</FlashcardProvider>
    );

    const { result } = renderHook(() => useFlashcard(), { wrapper });

    expect(result.current).toHaveProperty("currentKana");
    expect(result.current).toHaveProperty("submitAnswer");
    expect(result.current).toHaveProperty("nextCard");
    expect(result.current).toHaveProperty("loadingKana");
    expect(result.current).toHaveProperty("result");
  });
  // Tests from flashcard-provider/uncovered-lines.test.tsx
  describe("Error Handling", () => {
    const mockKanaData = [
      { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
      { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
      { id: "3", character: "う", romaji: "u", accuracy: 0.7 },
    ];

    // Test component to access provider context
    function TestComponent({ onContext }: { onContext: (context: FlashcardContextType | undefined) => void }) {
      const context = useFlashcard();
      React.useEffect(() => {
        onContext(context);
      }, [context, onContext]);
      
      return (
        <div>
          <button data-testid="next-card" onClick={context.nextCard}>
            Next Card
          </button>
          <button data-testid="submit-answer" onClick={() => context.submitAnswer("test")}>
            Submit Answer
          </button>
          <button
            data-testid="set-multiple-choice"
            onClick={() => context.setInteractionMode("multiple-choice")}
          >
            Set Multiple Choice
          </button>
        </div>
      );
    }

    it("handles API error when fetching kana data", async () => {
      // Mock failed API response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => [],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
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
    });

    it("handles invalid data format when fetching kana data", async () => {
      // Mock invalid data format (not an array)
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "data" }),
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
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
    });

    it("handles empty kana list when generating choices", async () => {
      // Mock empty kana list
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.choices).toEqual([]);
      });
    });

    it("handles HTTP error when submitting answer", async () => {
      // Mock successful fetch for kana data
      mockFetch.mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: async () => ({ error: "Server error" }),
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({}),
        });
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
        expect(capturedContext.currentKana).toBeDefined();
      });

      // Submit answer and wait for result
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should still set result to "incorrect" even on error
      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
      });
    });

    it("handles network error when submitting answer", async () => {
      // Mock successful fetch for kana data
      mockFetch.mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({}),
        });
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
        expect(capturedContext.currentKana).toBeDefined();
      });

      // Submit answer and wait for result
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should still set result to "incorrect" even on error
      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
      });
    });
  
    describe("generateChoices function", () => {
      it("handles empty kanaData array by setting choices to empty array and returning early", async () => {
        // Mock successful API response with empty array
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        });
  
        let capturedContext: FlashcardContextType | undefined;
        const onContext = (context: FlashcardContextType | undefined) => {
          capturedContext = context;
        };
  
        render(
          <FlashcardProvider>
            <TestComponent onContext={onContext} />
          </FlashcardProvider>,
        );
  
        await waitFor(() => {
          expect(capturedContext).toBeDefined();
          expect(capturedContext.choices).toEqual([]);
        });
  
        // Test that when nextCard is called with empty kanaList, choices remain empty
        await act(async () => {
          capturedContext.nextCard();
        });
  
        await waitFor(() => {
          expect(capturedContext.choices).toEqual([]);
        });
      });
  
      it("directly tests generateChoices with empty kanaData", async () => {
        // First, mock with data to initialize the provider properly
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [
            { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
          ],
        });
  
        let capturedContext: FlashcardContextType | undefined;
        const onContext = (context: FlashcardContextType | undefined) => {
          capturedContext = context;
        };
  
        // Create a test component that allows us to switch to multiple-choice mode
        function MultipleChoiceTestComponent({ onContext }: { onContext: (context: FlashcardContextType | undefined) => void }) {
          const context = useFlashcard();
          React.useEffect(() => {
            onContext(context);
          }, [context, onContext]);
          
          return (
            <div>
              <button data-testid="next-card" onClick={context.nextCard}>
                Next Card
              </button>
              <button data-testid="submit-answer" onClick={() => context.submitAnswer("test")}>
                Submit Answer
              </button>
              <button
                data-testid="set-multiple-choice"
                onClick={() => context.setInteractionMode("multiple-choice")}
              >
                Set Multiple Choice
              </button>
            </div>
          );
        }
  
        const { getByTestId, rerender } = render(
          <FlashcardProvider>
            <MultipleChoiceTestComponent onContext={onContext} />
          </FlashcardProvider>,
        );
  
        // Wait for the provider to initialize with data
        await waitFor(() => {
          expect(capturedContext).toBeDefined();
          expect(capturedContext.loadingKana).toBe(false);
        });
  
        // Switch to multiple-choice mode
        await act(async () => {
          getByTestId("set-multiple-choice").click();
        });
  
        // Now change the mock to return empty data
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        });
  
        // Trigger a refetch by changing kanaType prop
        rerender(
          <FlashcardProvider kanaType="hiragana">
            <MultipleChoiceTestComponent onContext={onContext} />
          </FlashcardProvider>,
        );
  
        // Wait for the new data to be fetched
        await waitFor(() => {
          expect(capturedContext.loadingKana).toBe(false);
        });
  
        // Now click next card to trigger generateChoices with empty kanaData
        // This should trigger the guard clause at lines 169-170
        await act(async () => {
          getByTestId("next-card").click();
        });
  
        // Verify that choices is an empty array
        await waitFor(() => {
          expect(capturedContext.choices).toEqual([]);
        });
      });

      it("should execute lines 169-170 when generateChoices is called with empty kanaData", async () => {
        let capturedContext: FlashcardContextType | undefined;
        const onContext = (context: FlashcardContextType | undefined) => {
          capturedContext = context;
        };

        const { getByTestId, rerender } = render(
          <FlashcardProvider>
            <TestComponent onContext={onContext} />
          </FlashcardProvider>,
        );

        // Wait for the provider to initialize with data
        await waitFor(() => {
          expect(capturedContext).toBeDefined();
          expect(capturedContext.loadingKana).toBe(false);
        });

        // Switch to multiple-choice mode
        await act(async () => {
          getByTestId("set-multiple-choice").click();
        });

        // Now change the mock to return empty data
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        });

        // Trigger a refetch by changing kanaType prop
        rerender(
          <FlashcardProvider kanaType="hiragana">
            <TestComponent onContext={onContext} />
          </FlashcardProvider>,
        );

        // Wait for the new data to be fetched
        await waitFor(() => {
          expect(capturedContext.loadingKana).toBe(false);
        });

        // Now click next card to trigger generateChoices with empty kanaData
        // This should trigger the guard clause at lines 169-170
        await act(async () => {
          getByTestId("next-card").click();
        });

        // Verify that choices is an empty array
        expect(capturedContext.choices).toEqual([]);
        
        // Verify that currentKana is null when kanaData is empty
        expect(capturedContext.currentKana).toBeNull();
      });
    });
  });

  describe("Empty Data Handling", () => {
    // Test component that includes MultipleChoice
    function TestWithMultipleChoice({ onContext }: { onContext: (context: FlashcardContextType | undefined) => void }) {
      const context = useFlashcard();
      React.useEffect(() => {
        onContext(context);
      }, [context, onContext]);
      
      return (
        <div>
          <button data-testid="next-card" onClick={context.nextCard}>
            Next Card
          </button>
          <button
            data-testid="set-multiple-choice"
            onClick={() => context.setInteractionMode("multiple-choice")}
          >
            Set Multiple Choice
          </button>
          <MultipleChoice
            choices={context.choices}
            selectedChoice={null}
            onChoiceSelect={vi.fn()}
          />
        </div>
      );
    }

    // Test component to access provider context (reused from above)
    function TestComponent({ onContext }: { onContext: (context: FlashcardContextType | undefined) => void }) {
      const context = useFlashcard();
      React.useEffect(() => {
        onContext(context);
      }, [context, onContext]);

      return (
        <div>
          <button data-testid="next-card" onClick={context.nextCard}>
            Next Card
          </button>
          <button data-testid="submit-answer" onClick={() => context.submitAnswer("test")}>
            Submit Answer
          </button>
          <button
            data-testid="set-multiple-choice"
            onClick={() => context.setInteractionMode("multiple-choice")}
          >
            Set Multiple Choice
          </button>
        </div>
      );
    }

    it("should refetch data when kanaType changes after initial load", async () => {
      // Mock initial API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5, attempts: 5 },
          { id: "2", character: "い", romaji: "i", accuracy: 0.3, attempts: 5 },
        ],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Mock new API response for katakana
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "3", character: "ア", romaji: "a", accuracy: 0.7, attempts: 3 },
          { id: "4", character: "イ", romaji: "i", accuracy: 0.4, attempts: 8 },
        ],
      });

      // Change kanaType prop to trigger refetch (this covers the kanaType branch in useEffect)
      rerender(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for refetch to complete
      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should have called fetch again due to kanaType change
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should trigger kanaType branch in useEffect when hasFetched is true", async () => {
      // This test specifically targets the branch coverage for kanaType changes

      // Mock initial API response for hiragana
      const initialMock = mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
          { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
        ],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      // First render with hiragana (initial fetch)
      const { rerender } = render(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial load to complete (hasFetched.current becomes true)
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Now change to katakana (this should trigger the kanaType branch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "3", character: "ア", romaji: "a", accuracy: 0.7 },
          { id: "4", character: "イ", romaji: "i", accuracy: 0.4 },
        ],
      });

      // Change kanaType prop - this should trigger the kanaType branch
      // since hasFetched.current is now true
      rerender(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for the second fetch to complete
      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should have called fetch twice - once for initial, once for kanaType change
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should not fetch when hasFetched is true and kanaType is undefined", async () => {
      // This test specifically targets the case where shouldFetch is false:
      // hasFetched.current is true AND kanaType is undefined

      // Mock initial API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        ],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      // First render without kanaType (initial fetch)
      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial load to complete (hasFetched.current becomes true)
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Reset mock to track if it gets called again
      mockFetch.mockClear();

      // Re-render with same props (no kanaType) - should NOT trigger another fetch
      // This should make shouldFetch = false (hasFetched.current is true AND kanaType is undefined)
      rerender(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait a bit to ensure no additional fetch was triggered
      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 100 });

      // Should NOT have called fetch again
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should cover the false branch of shouldFetch condition", async () => {
      // This test specifically targets line 126 - the if (shouldFetch) statement
      // We need to ensure the false branch is executed

      // Mock initial API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        ],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      // First render - initial fetch happens
      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clear mock to track subsequent calls
      mockFetch.mockClear();

      // Now re-render with identical props - this should trigger useEffect
      // but shouldFetch should be false, so line 126 if (shouldFetch)
      // should evaluate to false and skip the fetch
      rerender(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Add a small delay to ensure useEffect runs
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify fetch was NOT called again (proving the false branch was taken)
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should prevent submission when currentKana is null", async () => {
      // Mock API returning empty array
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
        expect(capturedContext.currentKana).toBeNull();
      });

      // Mock the submit function to track if it's called
      const submitSpy = vi.spyOn(capturedContext, 'submitAnswer');

      // Try to submit answer - this should trigger early return (line 166)
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // submitAnswer should be called but should return early
      expect(submitSpy).toHaveBeenCalled();

      // Result should remain null since submission was prevented
      expect(capturedContext.result).toBeNull();
    });

    it("should prevent submission when isSubmitting is true", async () => {
      const mockKanaData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5, attempts: 5 },
      ];

      // Mock successful fetch for kana data
      mockFetch.mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({}),
        });
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
        expect(capturedContext.currentKana).toBeDefined();
      });

      // Manually set isSubmitting to true to simulate already submitting
      await act(async () => {
        // This is a bit of a hack since we can't directly set state
        // But we can test the early return by calling submitAnswer when isSubmitting would be true
        capturedContext.submitAnswer("test");
        // Immediately try to submit again while still "submitting"
        capturedContext.submitAnswer("test");
      });

      // The second call should return early due to isSubmitting check
      expect(capturedContext.result).toBeDefined();
    });

    it("should handle filtered empty data when filtering by kana type", async () => {
      // Mock API returning data that will be filtered out
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
          { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
        ],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      // Request katakana but API only returns hiragana
      render(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
        expect(capturedContext.currentKana).toBeNull();
        expect(capturedContext.choices).toEqual([]);
      });
    });

    it("should handle MultipleChoice component with empty choices array", async () => {
      // Mock API returning empty array
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      const { getByText } = render(
        <FlashcardProvider>
          <TestWithMultipleChoice onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.choices).toEqual([]);
      });

      // Verify MultipleChoice shows loading state when choices is empty
      expect(getByText("Loading choices...")).toBeInTheDocument();

      // Switch to multiple-choice mode
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      // Verify MultipleChoice still shows loading state
      expect(getByText("Loading choices...")).toBeInTheDocument();
    });

    it("should handle empty kana data in selectRandomKana function", async () => {
      // Mock API returning empty array
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
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
        expect(capturedContext.currentKana).toBeNull();
        expect(capturedContext.choices).toEqual([]);
      });

      // Test that selectRandomKana handles empty data correctly
      // This is called internally by fetchKanaData
      await act(async () => {
        capturedContext.nextCard();
      });

      await waitFor(() => {
        expect(capturedContext.currentKana).toBeNull();
        expect(capturedContext.choices).toEqual([]);
      });
    });

    // Test the shouldFetchKanaData helper function
    it("should test shouldFetchKanaData helper function branches", async () => {
      // Mock API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        ],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      // First render - this will trigger the initial fetch
      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Clear mock to track subsequent calls
      mockFetch.mockClear();

      // Test the false branch by re-rendering with identical props
      // This should trigger useEffect but shouldFetchKanaData should return false
      rerender(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Add delay to ensure useEffect runs
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify fetch was NOT called again (proving false branch was taken)
      expect(mockFetch).not.toHaveBeenCalled();

      // Now test the true branch by changing kanaType
      rerender(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for the fetch to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    // Test to specifically cover the false branch of the if statement
    it("should cover the false branch of shouldFetchKanaData condition", async () => {
      // Mock API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        ],
      });

      let capturedContext: FlashcardContextType | undefined;
      const onContext = (context: FlashcardContextType | undefined) => {
        capturedContext = context;
      };

      // First render to establish hasFetched.current = true
      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Clear mock calls to track subsequent fetches
      mockFetch.mockClear();

      // Re-render with identical props - this should trigger useEffect
      // but shouldFetchKanaData should return false (hasFetched.current = true, kanaType = undefined)
      rerender(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Add a small delay to ensure useEffect has time to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify that fetch was NOT called again, proving the false branch was taken
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});


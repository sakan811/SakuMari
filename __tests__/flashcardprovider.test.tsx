import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup, render, act, waitFor } from "@testing-library/react";
import React from "react";
import {
  FlashcardProvider,
  useFlashcard,
} from "../components/FlashcardProvider";

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
    function TestComponent({ onContext }: { onContext: (context: any) => void }) {
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
    });

    it("handles invalid data format when fetching kana data", async () => {
      // Mock invalid data format (not an array)
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "data" }),
      });

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
    });

    it("handles empty kana list when generating choices", async () => {
      // Mock empty kana list
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

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

      let capturedContext: any;
      const onContext = (context: any) => {
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

      let capturedContext: any;
      const onContext = (context: any) => {
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
  });
});

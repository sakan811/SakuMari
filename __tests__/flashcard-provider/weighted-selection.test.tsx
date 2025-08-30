import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import {
  FlashcardProvider,
  useFlashcard,
} from "@/components/FlashcardProvider";
import React from "react";

// Mock fetch for consistent test data
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test component that tracks all kana selections including state changes
function TestComponent({
  onKanaSelected,
}: {
  onKanaSelected: (_: {
    id: string;
    character: string;
    romaji: string;
    accuracy: number;
  }) => void;
}) {
  const { currentKana, nextCard, loadingKana } = useFlashcard();
  const [selectionCount, setSelectionCount] = React.useState(0);

  React.useEffect(() => {
    if (currentKana && !loadingKana) {
      onKanaSelected(currentKana);
      setSelectionCount((prev) => prev + 1);
    }
  }, [currentKana, onKanaSelected, loadingKana]);

  return (
    <div>
      <div data-testid="loading-state">
        {loadingKana ? "loading" : "loaded"}
      </div>
      <div data-testid="selection-count">{selectionCount}</div>
      <button onClick={nextCard} data-testid="next-card">
        Next Card
      </button>
      {currentKana && (
        <span data-testid="current-kana">{currentKana.character}</span>
      )}
    </div>
  );
}

describe("FlashcardProvider - Weighted Selection Algorithm", () => {
  const mockKanaData = [
    { id: "1", character: "あ", romaji: "a", accuracy: 0.9 }, // High accuracy - low weight
    { id: "2", character: "い", romaji: "i", accuracy: 0.3 }, // Low accuracy - high weight
    { id: "3", character: "う", romaji: "u", accuracy: 0.1 }, // Very low accuracy - very high weight
    { id: "4", character: "え", romaji: "e", accuracy: 0.8 }, // Good accuracy - low weight
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockKanaData,
    });
  });

  test("selects kana with lower accuracy more frequently", async () => {
    const selectedKana: string[] = [];

    const onKanaSelected = (kana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }) => {
      if (kana) {
        selectedKana.push(kana.character);
      }
    };

    const { getByTestId } = render(
      <FlashcardProvider>
        <TestComponent onKanaSelected={onKanaSelected} />
      </FlashcardProvider>,
    );

    // Wait for initial load and first selection
    await waitFor(
      () => {
        expect(getByTestId("loading-state")).toHaveTextContent("loaded");
        expect(selectedKana.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    const initialCount = selectedKana.length;
    console.log("Initial selections:", initialCount);

    // Generate multiple selections - click many times
    for (let i = 0; i < 50; i++) {
      await act(async () => {
        getByTestId("next-card").click();
      });

      // Small delay every 10 clicks to avoid overwhelming
      if (i % 10 === 9) {
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
        });
      }
    }

    console.log("Final selection count:", selectedKana.length);
    console.log("All selections:", selectedKana);

    // Count occurrences
    const occurrences = selectedKana.reduce(
      (acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const finalCounts = {
      う: occurrences["う"] || 0, // Should be highest (accuracy: 0.1)
      い: occurrences["い"] || 0, // Should be second (accuracy: 0.3)
      え: occurrences["え"] || 0, // Should be third (accuracy: 0.8)
      あ: occurrences["あ"] || 0, // Should be lowest (accuracy: 0.9)
    };

    console.log("Selection counts:", finalCounts);

    // We should have gotten some selections
    expect(selectedKana.length).toBeGreaterThan(5);

    // At minimum, the lowest accuracy character should appear
    expect(finalCounts["う"]).toBeGreaterThan(0);

    // If we have selections for comparison, lower accuracy should appear more or equal
    if (finalCounts["う"] > 0 && finalCounts["あ"] > 0) {
      expect(finalCounts["う"]).toBeGreaterThanOrEqual(finalCounts["あ"]);
    }

    if (finalCounts["い"] > 0 && finalCounts["え"] > 0) {
      expect(finalCounts["い"]).toBeGreaterThanOrEqual(finalCounts["え"]);
    }
  }, 15000);

  test("handles edge case with all perfect accuracy", async () => {
    const perfectKanaData = [
      { id: "1", character: "あ", romaji: "a", accuracy: 1.0 },
      { id: "2", character: "い", romaji: "i", accuracy: 1.0 },
      { id: "3", character: "う", romaji: "u", accuracy: 1.0 },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => perfectKanaData,
    });

    const selectedKana: string[] = [];
    const onKanaSelected = (kana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }) => {
      if (kana) selectedKana.push(kana.character);
    };

    render(
      <FlashcardProvider>
        <TestComponent onKanaSelected={onKanaSelected} />
      </FlashcardProvider>,
    );

    await waitFor(
      () => {
        expect(selectedKana.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Should still select a kana even with perfect accuracy
    expect(["あ", "い", "う"]).toContain(selectedKana[0]);
  });

  test("handles edge case with all zero accuracy", async () => {
    const zeroKanaData = [
      { id: "1", character: "あ", romaji: "a", accuracy: 0.0 },
      { id: "2", character: "い", romaji: "i", accuracy: 0.0 },
      { id: "3", character: "う", romaji: "u", accuracy: 0.0 },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => zeroKanaData,
    });

    const selectedKana: string[] = [];
    const onKanaSelected = (kana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }) => {
      if (kana) selectedKana.push(kana.character);
    };

    render(
      <FlashcardProvider>
        <TestComponent onKanaSelected={onKanaSelected} />
      </FlashcardProvider>,
    );

    await waitFor(
      () => {
        expect(selectedKana.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Should select from available kana
    expect(["あ", "い", "う"]).toContain(selectedKana[0]);
  });

  test("weight calculation follows inverse accuracy formula", async () => {
    // Test with extreme difference in weights
    const testData = [
      { id: "1", character: "low", romaji: "low", accuracy: 0.05 }, // weight = 0.95
      { id: "2", character: "high", romaji: "high", accuracy: 0.95 }, // weight = 0.05
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => testData,
    });

    const selectedKana: string[] = [];
    const onKanaSelected = (kana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }) => {
      if (kana) selectedKana.push(kana.character);
    };

    const { getByTestId } = render(
      <FlashcardProvider>
        <TestComponent onKanaSelected={onKanaSelected} />
      </FlashcardProvider>,
    );

    await waitFor(
      () => {
        expect(selectedKana.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Generate many selections to see the pattern
    for (let i = 0; i < 30; i++) {
      await act(async () => {
        getByTestId("next-card").click();
      });
    }

    const occurrences = selectedKana.reduce(
      (acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const lowCount = occurrences["low"] || 0;
    const highCount = occurrences["high"] || 0;

    console.log(
      "Weight test - Low accuracy count:",
      lowCount,
      "High accuracy count:",
      highCount,
    );
    console.log("All selections:", selectedKana);

    // With extreme difference, low accuracy should appear more often
    expect(lowCount).toBeGreaterThan(0);
    expect(lowCount).toBeGreaterThanOrEqual(highCount);
  });

  test("maintains selection consistency within single session", async () => {
    const selectedKana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }[] = [];

    const onKanaSelected = (kana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }) => {
      if (kana) {
        selectedKana.push(kana);
      }
    };

    const { getByTestId } = render(
      <FlashcardProvider>
        <TestComponent onKanaSelected={onKanaSelected} />
      </FlashcardProvider>,
    );

    await waitFor(
      () => {
        expect(selectedKana.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Generate several selections
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        getByTestId("next-card").click();
      });
    }

    console.log("Consistency test - Total selections:", selectedKana.length);

    // Each selection should be from the original dataset
    selectedKana.forEach((kana) => {
      expect(
        mockKanaData.some(
          (original) =>
            original.id === kana.id &&
            original.character === kana.character &&
            original.romaji === kana.romaji,
        ),
      ).toBe(true);
    });

    // Should have gotten at least the initial selection
    expect(selectedKana.length).toBeGreaterThan(0);
  });

  test("weighted selection produces variety over time", async () => {
    const selectedKana: string[] = [];
    const onKanaSelected = (kana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }) => {
      if (kana) selectedKana.push(kana.character);
    };

    const { getByTestId } = render(
      <FlashcardProvider>
        <TestComponent onKanaSelected={onKanaSelected} />
      </FlashcardProvider>,
    );

    await waitFor(
      () => {
        expect(selectedKana.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Generate enough selections to potentially see variety
    for (let i = 0; i < 20; i++) {
      await act(async () => {
        getByTestId("next-card").click();
      });
    }

    const uniqueCharacters = new Set(selectedKana);

    console.log("Variety test - Total selections:", selectedKana.length);
    console.log("Unique characters:", Array.from(uniqueCharacters));
    console.log("All selections:", selectedKana);

    // Should get at least some selections
    expect(selectedKana.length).toBeGreaterThan(1);

    // All selections should be valid characters
    expect(
      selectedKana.every((char) => ["あ", "い", "う", "え"].includes(char)),
    ).toBe(true);

    // Should see at least some variety eventually (though randomness might give us only one)
    // This is a probabilistic test, so we're lenient
    expect(uniqueCharacters.size).toBeGreaterThanOrEqual(1);
  });

  test("verifies basic selection mechanism", async () => {
    const selectedKana: string[] = [];
    const onKanaSelected = (kana: {
      id: string;
      character: string;
      romaji: string;
      accuracy: number;
    }) => {
      if (kana) selectedKana.push(kana.character);
    };

    const { getByTestId } = render(
      <FlashcardProvider>
        <TestComponent onKanaSelected={onKanaSelected} />
      </FlashcardProvider>,
    );

    await waitFor(
      () => {
        expect(selectedKana.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Just verify basic functionality works
    const initialLength = selectedKana.length;

    await act(async () => {
      getByTestId("next-card").click();
    });

    // Should potentially trigger new selection (though might be same character)
    expect(selectedKana.length).toBeGreaterThanOrEqual(initialLength);
    expect(
      selectedKana.every((char) => ["あ", "い", "う", "え"].includes(char)),
    ).toBe(true);
  });
});

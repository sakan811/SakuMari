import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import {
  FlashcardProvider,
  useFlashcard,
} from "@/components/FlashcardProvider";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function ChoicesTestComponent() {
  const { currentKana, choices, setInteractionMode } = useFlashcard();

  return (
    <div>
      <button
        data-testid="set-multiple-choice"
        onClick={() => setInteractionMode("multiple-choice")}
      >
        Set Multiple Choice
      </button>
      {currentKana && (
        <span data-testid="current-kana">{currentKana.character}</span>
      )}
      <div data-testid="choices">
        {choices.map((choice, index) => (
          <span key={index} data-testid={`choice-${index}`}>
            {choice}
          </span>
        ))}
      </div>
      <span data-testid="choices-count">{choices.length}</span>
    </div>
  );
}

describe("FlashcardProvider - Multiple Choice Generation", () => {
  const mockKanaData = [
    { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
    { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
    { id: "3", character: "う", romaji: "u", accuracy: 0.7 },
    { id: "4", character: "え", romaji: "e", accuracy: 0.4 },
    { id: "5", character: "お", romaji: "o", accuracy: 0.6 },
    { id: "6", character: "か", romaji: "ka", accuracy: 0.2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockKanaData,
    });
  });

  test("generates exactly 4 choices including correct answer", async () => {
    const { getByTestId } = render(
      <FlashcardProvider>
        <ChoicesTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    await act(async () => {
      getByTestId("set-multiple-choice").click();
    });

    expect(getByTestId("choices-count")).toHaveTextContent("4");
  });

  test("always includes correct answer in choices", async () => {
    const { getByTestId } = render(
      <FlashcardProvider>
        <ChoicesTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    const currentKana = getByTestId("current-kana").textContent;
    const correctAnswer = mockKanaData.find(
      (k) => k.character === currentKana,
    )?.romaji;

    await act(async () => {
      getByTestId("set-multiple-choice").click();
    });

    const choices = Array.from(
      { length: 4 },
      (_, i) => getByTestId(`choice-${i}`).textContent,
    );

    expect(choices).toContain(correctAnswer);
  });

  test("generates unique wrong answers", async () => {
    const { getByTestId } = render(
      <FlashcardProvider>
        <ChoicesTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    await act(async () => {
      getByTestId("set-multiple-choice").click();
    });

    const choices = Array.from(
      { length: 4 },
      (_, i) => getByTestId(`choice-${i}`).textContent,
    );

    // All choices should be unique
    const uniqueChoices = new Set(choices);
    expect(uniqueChoices.size).toBe(4);
  });

  test("shuffles choice positions randomly", async () => {
    const positionMaps: number[][] = [];

    // Generate multiple choice sets to test randomization
    for (let trial = 0; trial < 10; trial++) {
      const { getByTestId, unmount } = render(
        <FlashcardProvider>
          <ChoicesTestComponent />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(getByTestId("current-kana")).toBeInTheDocument();
      });

      const currentKana = getByTestId("current-kana").textContent;
      const correctAnswer = mockKanaData.find(
        (k) => k.character === currentKana,
      )?.romaji;

      await act(async () => {
        getByTestId("set-multiple-choice").click();
      });

      const choices = Array.from(
        { length: 4 },
        (_, i) => getByTestId(`choice-${i}`).textContent,
      );

      const correctPosition = choices.indexOf(correctAnswer!);
      positionMaps.push([correctPosition]);

      unmount();
    }

    // The correct answer should appear in different positions
    const positions = positionMaps.map((map) => map[0]);
    const uniquePositions = new Set(positions);

    // Should have some variation in positions (not always in the same spot)
    expect(uniquePositions.size).toBeGreaterThan(1);
  });

  test("handles insufficient wrong answers gracefully", async () => {
    const limitedKanaData = [
      { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
      { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => limitedKanaData,
    });

    const { getByTestId } = render(
      <FlashcardProvider>
        <ChoicesTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    await act(async () => {
      getByTestId("set-multiple-choice").click();
    });

    // Should still generate choices, even if less than 4
    const choicesCount = parseInt(
      getByTestId("choices-count").textContent || "0",
    );
    expect(choicesCount).toBeGreaterThan(0);
    expect(choicesCount).toBeLessThanOrEqual(4);
  });

  test("excludes duplicate romaji from wrong answers", async () => {
    const duplicateRomajiData = [
      { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
      { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
      { id: "3", character: "ぢ", romaji: "ji", accuracy: 0.7 }, // Duplicate with じ
      { id: "4", character: "じ", romaji: "ji", accuracy: 0.4 }, // Duplicate with ぢ
      { id: "5", character: "づ", romaji: "zu", accuracy: 0.6 }, // Duplicate with ず
      { id: "6", character: "ず", romaji: "zu", accuracy: 0.2 }, // Duplicate with づ
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => duplicateRomajiData,
    });

    const { getByTestId } = render(
      <FlashcardProvider>
        <ChoicesTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    await act(async () => {
      getByTestId("set-multiple-choice").click();
    });

    const choices = Array.from({ length: 4 }, (_, i) => {
      const element = getByTestId(`choice-${i}`);
      return element ? element.textContent : null;
    }).filter(Boolean);

    // All choices should be unique (no duplicate romaji)
    const uniqueChoices = new Set(choices);
    expect(uniqueChoices.size).toBe(choices.length);
  });

  test("handles empty dataset gracefully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByTestId } = render(
      <FlashcardProvider>
        <ChoicesTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      // Should not crash and choices should be empty
      expect(getByTestId("choices-count")).toHaveTextContent("0");
    });
  });

  test("regenerates choices when switching to new kana", async () => {
    function NextCardTestComponent() {
      const { currentKana, choices, setInteractionMode, nextCard } =
        useFlashcard();

      return (
        <div>
          <button
            data-testid="set-multiple-choice"
            onClick={() => setInteractionMode("multiple-choice")}
          >
            Set Multiple Choice
          </button>
          <button data-testid="next-card" onClick={nextCard}>
            Next Card
          </button>
          {currentKana && (
            <span data-testid="current-kana">{currentKana.character}</span>
          )}
          <div data-testid="choices">
            {choices.map((choice, index) => (
              <span key={index} data-testid={`choice-${index}`}>
                {choice}
              </span>
            ))}
          </div>
        </div>
      );
    }

    const { getByTestId } = render(
      <FlashcardProvider>
        <NextCardTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    await act(async () => {
      getByTestId("set-multiple-choice").click();
    });

    const firstKana = getByTestId("current-kana").textContent;
    const firstChoices = Array.from(
      { length: 4 },
      (_, i) => getByTestId(`choice-${i}`).textContent,
    );

    // Go to next card
    await act(async () => {
      getByTestId("next-card").click();
    });

    await waitFor(() => {
      const secondKana = getByTestId("current-kana").textContent;
      // Should be different kana (though could theoretically be same due to randomness)
      const secondChoices = Array.from(
        { length: 4 },
        (_, i) => getByTestId(`choice-${i}`).textContent,
      );

      // If different kana, choices should include the new correct answer
      if (secondKana !== firstKana) {
        const correctAnswer = mockKanaData.find(
          (k) => k.character === secondKana,
        )?.romaji;
        expect(secondChoices).toContain(correctAnswer);
      }
    });
  });
});

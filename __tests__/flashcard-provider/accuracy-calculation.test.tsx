import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import {
  FlashcardProvider,
  useFlashcard,
} from "@/components/FlashcardProvider";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function AccuracyTestComponent() {
  const { currentKana, submitAnswer, result, loadingKana } = useFlashcard();

  return (
    <div>
      <div data-testid="loading-state">
        {loadingKana ? "loading" : "loaded"}
      </div>
      {currentKana && (
        <>
          <span data-testid="current-kana">{currentKana.character}</span>
          <span data-testid="current-accuracy">{currentKana.accuracy}</span>
          <button
            data-testid="submit-correct"
            onClick={() => submitAnswer(currentKana.romaji)}
          >
            Submit Correct
          </button>
          <button
            data-testid="submit-incorrect"
            onClick={() => submitAnswer("wrong")}
          >
            Submit Incorrect
          </button>
        </>
      )}
      {result && <span data-testid="result">{result}</span>}
    </div>
  );
}

describe("FlashcardProvider - Accuracy Calculation", () => {
  const mockKanaData = [
    { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to ensure clean state
    mockFetch.mockReset();
  });

  test("submits correct answer with proper payload", async () => {
    // Mock the flashcards fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKanaData,
    });

    const { getByTestId } = render(
      <FlashcardProvider>
        <AccuracyTestComponent />
      </FlashcardProvider>,
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByTestId("loading-state")).toHaveTextContent("loaded");
    });

    // Wait for kana to appear
    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    // Mock the submit endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      getByTestId("submit-correct").click();
    });

    // Check the submit call was made correctly
    expect(mockFetch).toHaveBeenCalledWith("/api/flashcards/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kanaId: "1",
        isCorrect: true,
        interactionMode: "typing",
      }),
    });

    await waitFor(() => {
      expect(getByTestId("result")).toHaveTextContent("correct");
    });
  });

  test("submits incorrect answer with proper payload", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKanaData,
    });

    const { getByTestId } = render(
      <FlashcardProvider>
        <AccuracyTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      getByTestId("submit-incorrect").click();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/flashcards/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kanaId: "1",
        isCorrect: false,
        interactionMode: "typing",
      }),
    });

    await waitFor(() => {
      expect(getByTestId("result")).toHaveTextContent("incorrect");
    });
  });

  test("handles case-insensitive answer comparison", async () => {
    const upperCaseKana = [
      { id: "1", character: "あ", romaji: "A", accuracy: 0.5 },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => upperCaseKana,
    });

    function CaseTestComponent() {
      const { currentKana, submitAnswer, result } = useFlashcard();

      return (
        <div>
          {currentKana && (
            <>
              <span data-testid="current-kana">{currentKana.character}</span>
              <button
                data-testid="submit-lowercase"
                onClick={() => submitAnswer("a")}
              >
                Submit Lowercase
              </button>
              {result && <span data-testid="result">{result}</span>}
            </>
          )}
        </div>
      );
    }

    const { getByTestId } = render(
      <FlashcardProvider>
        <CaseTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      getByTestId("submit-lowercase").click();
    });

    await waitFor(() => {
      expect(getByTestId("result")).toHaveTextContent("correct");
    });
  });

  test("trims whitespace from user input", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKanaData,
    });

    function WhitespaceTestComponent() {
      const { currentKana, submitAnswer, result } = useFlashcard();

      return (
        <div>
          {currentKana && (
            <>
              <span data-testid="current-kana">{currentKana.character}</span>
              <button
                data-testid="submit-whitespace"
                onClick={() => submitAnswer("  a  ")}
              >
                Submit With Whitespace
              </button>
              {result && <span data-testid="result">{result}</span>}
            </>
          )}
        </div>
      );
    }

    const { getByTestId } = render(
      <FlashcardProvider>
        <WhitespaceTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      getByTestId("submit-whitespace").click();
    });

    await waitFor(() => {
      expect(getByTestId("result")).toHaveTextContent("correct");
    });
  });

  test("handles API submission errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // First call for loading kana data - succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKanaData,
    });

    const { getByTestId } = render(
      <FlashcardProvider>
        <AccuracyTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    // Second call for submitting answer - fails
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      getByTestId("submit-correct").click();
    });

    // Should still show result even if API fails
    await waitFor(() => {
      expect(getByTestId("result")).toHaveTextContent("correct");
    });

    // Give some time for the error to be logged
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error submitting answer:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  test("includes interaction mode in submission payload", async () => {
    // Mock the initial kana data fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKanaData,
    });

    function ModeTestComponent() {
      const { currentKana, submitAnswer, setInteractionMode } = useFlashcard();

      return (
        <div>
          {currentKana && (
            <>
              <span data-testid="current-kana">{currentKana.character}</span>
              <button
                data-testid="set-multiple-choice"
                onClick={() => setInteractionMode("multiple-choice")}
              >
                Set Multiple Choice
              </button>
              <button
                data-testid="submit-answer"
                onClick={() => submitAnswer(currentKana.romaji)}
              >
                Submit
              </button>
            </>
          )}
        </div>
      );
    }

    const { getByTestId } = render(
      <FlashcardProvider>
        <ModeTestComponent />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("current-kana")).toBeInTheDocument();
    });

    // Change to multiple choice mode
    await act(async () => {
      getByTestId("set-multiple-choice").click();
    });

    // Mock the submit endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      getByTestId("submit-answer").click();
    });

    // Check that the submit was called with multiple-choice mode
    expect(mockFetch).toHaveBeenLastCalledWith("/api/flashcards/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kanaId: "1",
        isCorrect: true,
        interactionMode: "multiple-choice",
      }),
    });
  });
});

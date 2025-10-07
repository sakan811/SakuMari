import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Flashcard from "../components/Flashcard";
import { useFlashcard } from "../components/FlashcardProvider";
import { mockFlashcardProvider, mockKanaData } from "./utils/mock-setup";

vi.mock("../components/FlashcardProvider", () => ({
  useFlashcard: vi.fn(),
}));

// Test configuration constants
const DEFAULT_CHOICES = ["a", "ka", "sa", "ta"];
const DEFAULT_INTERACTION_MODE = "typing" as const;
const MOCK_KANA = mockKanaData();

type FlashcardProviderMock = ReturnType<typeof mockFlashcardProvider>;

// Helper functions for test setup
function createMockProvider(
  overrides: Partial<FlashcardProviderMock> = {},
): FlashcardProviderMock {
  return mockFlashcardProvider({
    interactionMode: DEFAULT_INTERACTION_MODE,
    choices: DEFAULT_CHOICES,
    ...overrides,
  });
}

function setupProvider(mockProvider: FlashcardProviderMock) {
  (useFlashcard as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
}

function getSubmitButton() {
  return screen.getByRole("button", { name: "Submit" });
}

function getNextButton() {
  return screen.getByRole("button", { name: "Next Card" });
}

function getInputField() {
  return screen.getByPlaceholderText("Type romaji equivalent...");
}

function getMultipleChoiceButton() {
  return screen.getByTestId("multiple-choice-button");
}

describe("Flashcard Component", () => {
  beforeEach(() => {
    setupProvider(createMockProvider());
  });

  test("shows loading state", () => {
    setupProvider(createMockProvider({ loadingKana: true }));
    render(<Flashcard />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  test("shows empty state when no cards", () => {
    render(<Flashcard />);
    expect(screen.getByText("No flashcards available.")).toBeDefined();
  });

  test("renders flashcard and handles submission", async () => {
    const submitAnswer = vi.fn();
    setupProvider(createMockProvider({ currentKana: MOCK_KANA, submitAnswer }));

    render(<Flashcard />);

    expect(screen.getByText("あ")).toBeDefined();

    const input = getInputField();
    const submitButton = getSubmitButton();

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.click(submitButton);

    expect(submitAnswer).toHaveBeenCalledWith("a");
  });

  test("shows results and handles next card", () => {
    const nextCard = vi.fn();
    setupProvider(
      createMockProvider({
        currentKana: MOCK_KANA,
        result: "correct",
        nextCard,
      }),
    );

    render(<Flashcard />);

    expect(screen.getByText("Correct!")).toBeDefined();

    fireEvent.click(getNextButton());
    expect(nextCard).toHaveBeenCalled();
  });

  test("validates empty input", () => {
    setupProvider(createMockProvider({ currentKana: MOCK_KANA }));

    render(<Flashcard />);

    fireEvent.click(getSubmitButton());
    expect(screen.getByText("Please enter an answer")).toBeDefined();
  });

  test("validates empty selection in multiple choice mode", () => {
    setupProvider(
      createMockProvider({
        currentKana: MOCK_KANA,
        interactionMode: "multiple-choice",
      }),
    );

    render(<Flashcard />);

    fireEvent.click(getSubmitButton());
    expect(screen.getByText("Please select an answer")).toBeDefined();
  });

  describe("Keyboard Navigation", () => {
    test("submits answer when Enter is pressed in typing mode", () => {
      const submitAnswer = vi.fn();
      setupProvider(
        createMockProvider({ currentKana: MOCK_KANA, submitAnswer }),
      );

      render(<Flashcard />);

      const input = getInputField();
      fireEvent.change(input, { target: { value: "a" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(submitAnswer).toHaveBeenCalledWith("a");
    });

    test("advances to next card when Enter is pressed after result is shown", () => {
      const nextCard = vi.fn();
      setupProvider(
        createMockProvider({
          currentKana: MOCK_KANA,
          result: "correct",
          nextCard,
        }),
      );

      render(<Flashcard />);

      fireEvent.keyDown(window, { key: "Enter", code: "Enter" });
      expect(nextCard).toHaveBeenCalled();
    });
  });

  describe("Disabled States", () => {
    test("disables input and submit button when processing", () => {
      setupProvider(
        createMockProvider({ currentKana: MOCK_KANA, isSubmitting: true }),
      );

      render(<Flashcard />);

      const input = getInputField();
      const submitButton = screen.getByRole("button", {
        name: "Submitting...",
      });

      expect(input).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton.textContent).toBe("Submitting...");
    });

    test("disables next card button when processing", () => {
      setupProvider(
        createMockProvider({
          currentKana: MOCK_KANA,
          result: "correct",
          isSubmitting: true,
        }),
      );

      render(<Flashcard />);

      const nextButton = screen.getByRole("button", { name: "Loading..." });
      expect(nextButton).toBeDisabled();
      expect(nextButton.textContent).toBe("Loading...");
    });
  });

  describe("Mode Switching", () => {
    test("calls onModeChange when typing button is clicked", () => {
      const setInteractionMode = vi.fn();
      setupProvider(
        createMockProvider({ currentKana: MOCK_KANA, setInteractionMode }),
      );

      render(<Flashcard />);

      fireEvent.click(getMultipleChoiceButton());
      expect(setInteractionMode).toHaveBeenCalledWith("multiple-choice");
    });

    test("does not change mode when submitting", () => {
      const setInteractionMode = vi.fn();
      setupProvider(
        createMockProvider({
          currentKana: MOCK_KANA,
          setInteractionMode,
          isSubmitting: true,
        }),
      );

      render(<Flashcard />);

      fireEvent.click(getMultipleChoiceButton());
      expect(setInteractionMode).not.toHaveBeenCalled();
    });
  });

  describe("Error Display", () => {
    test("displays error message with dismiss button", () => {
      const clearError = vi.fn();
      setupProvider(
        createMockProvider({
          currentKana: MOCK_KANA,
          error: "Network error occurred",
          clearError,
        }),
      );

      render(<Flashcard />);

      expect(screen.getByText("Network error occurred")).toBeInTheDocument();
      expect(screen.getByText("Dismiss")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Dismiss"));
      expect(clearError).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    test("handles whitespace-only input", () => {
      const submitAnswer = vi.fn();
      setupProvider(createMockProvider({
        currentKana: MOCK_KANA,
        submitAnswer,
        interactionMode: "typing"
      }));

      render(<Flashcard />);

      const input = getInputField();
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(getSubmitButton());

      expect(screen.getByText("Please enter an answer")).toBeInTheDocument();
      expect(submitAnswer).not.toHaveBeenCalled();
    });

    test("cleans up on unmount", () => {
      const removeListener = vi.spyOn(window, "removeEventListener");

      setupProvider(createMockProvider({
        currentKana: MOCK_KANA,
        result: "correct",
        interactionMode: "typing"
      }));

      const { unmount } = render(<Flashcard />);
      unmount();

      expect(removeListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
    });

    test("displays correct answer with green styling", () => {
      const submitAnswer = vi.fn();
      setupProvider(createMockProvider({
        currentKana: MOCK_KANA,
        result: { correct: true, correctAnswer: "a" },
        submitAnswer,
        interactionMode: "typing"
      }));

      render(<Flashcard />);

      expect(screen.getByText("Incorrect!")).toBeInTheDocument();
      expect(screen.getByText(/The correct answer is:/)).toBeInTheDocument();
      expect(screen.getByText("a", { selector: "strong" })).toBeInTheDocument();

      const resultContainer = screen.getByText(/Incorrect!/).closest('div');
      expect(resultContainer).toHaveClass("bg-[#ae0d13]", "text-white", "border-[#950a1e]");
    });

    test("clears local error when user types valid input", () => {
      const submitAnswer = vi.fn();
      setupProvider(createMockProvider({
        currentKana: MOCK_KANA,
        submitAnswer,
        interactionMode: "typing",
        error: "Previous error"
      }));

      render(<Flashcard />);

      const input = getInputField();

      // First, trigger an error
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.click(getSubmitButton());
      expect(screen.getByText("Please enter an answer")).toBeInTheDocument();

      // Then type valid input
      fireEvent.change(input, { target: { value: "a" } });

      // Local error should be cleared
      expect(screen.queryByText("Please enter an answer")).not.toBeInTheDocument();
    });

    test("submits selected choice in multiple choice mode", () => {
      const submitAnswer = vi.fn();
      setupProvider(createMockProvider({
        currentKana: MOCK_KANA,
        submitAnswer,
        interactionMode: "multiple-choice",
        choices: ["a", "i", "u", "e"]
      }));

      render(<Flashcard />);

      // First select a choice
      const choiceButtons = screen.getAllByTestId(/choice-button-/);
      fireEvent.click(choiceButtons[1]); // Select the second choice ("i")

      const submitButton = getSubmitButton();
      fireEvent.click(submitButton);

      // Should call submitAnswer with the selected choice value
      expect(submitAnswer).toHaveBeenCalledWith("i");
    });
  });
});
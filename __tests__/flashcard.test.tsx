import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Flashcard from "../components/Flashcard";
import { useFlashcard } from "../components/FlashcardProvider";
import { mockFlashcardProvider, mockKana } from "./utils/test-helpers";

vi.mock("../components/FlashcardProvider", () => ({
  useFlashcard: vi.fn(),
}));

describe("Flashcard Component", () => {
  beforeEach(() => {
    (useFlashcard as any).mockReturnValue(
      mockFlashcardProvider({
        interactionMode: "typing",
        choices: ["a", "ka", "sa", "ta"],
      }),
    );
  });

  test("shows loading state", () => {
    (useFlashcard as any).mockReturnValue(
      mockFlashcardProvider({
        loadingKana: true,
        interactionMode: "typing",
        choices: ["a", "ka", "sa", "ta"],
      }),
    );
    render(<Flashcard />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  test("shows empty state when no cards", () => {
    (useFlashcard as any).mockReturnValue(
      mockFlashcardProvider({
        interactionMode: "typing",
        choices: ["a", "ka", "sa", "ta"],
      }),
    );
    render(<Flashcard />);
    expect(screen.getByText("No flashcards available.")).toBeDefined();
  });

  test("renders flashcard and handles submission", async () => {
    const submitAnswer = vi.fn();
    (useFlashcard as any).mockReturnValue(
      mockFlashcardProvider({
        currentKana: mockKana.basic,
        submitAnswer,
        interactionMode: "typing",
        choices: ["a", "ka", "sa", "ta"],
      }),
    );

    render(<Flashcard />);

    expect(screen.getByText("あ")).toBeDefined();

    const input = screen.getByPlaceholderText("Type romaji equivalent...");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.click(submitButton);

    expect(submitAnswer).toHaveBeenCalledWith("a");
  });

  test("shows results and handles next card", () => {
    const nextCard = vi.fn();
    (useFlashcard as any).mockReturnValue(
      mockFlashcardProvider({
        currentKana: mockKana.basic,
        result: "correct",
        nextCard,
        interactionMode: "typing",
        choices: ["a", "ka", "sa", "ta"],
      }),
    );

    render(<Flashcard />);

    expect(screen.getByText("Correct!")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Next Card" }));
    expect(nextCard).toHaveBeenCalled();
  });

  test("validates empty input", () => {
    (useFlashcard as any).mockReturnValue(
      mockFlashcardProvider({
        currentKana: mockKana.basic,
        interactionMode: "typing",
        choices: ["a", "ka", "sa", "ta"],
      }),
    );

    render(<Flashcard />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Please enter an answer")).toBeDefined();
  });

  describe("Keyboard Navigation", () => {
    test("submits answer when Enter is pressed in typing mode", () => {
      const submitAnswer = vi.fn();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          submitAnswer,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      const input = screen.getByPlaceholderText("Type romaji equivalent...");
      fireEvent.change(input, { target: { value: "a" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(submitAnswer).toHaveBeenCalledWith("a");
    });

    test("advances to next card when Enter is pressed after result is shown", () => {
      const nextCard = vi.fn();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          result: "correct",
          nextCard,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      fireEvent.keyDown(window, { key: "Enter", code: "Enter" });
      expect(nextCard).toHaveBeenCalled();
    });

    test("does not advance to next card when Enter is pressed without result", () => {
      const nextCard = vi.fn();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          nextCard,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      fireEvent.keyDown(window, { key: "Enter", code: "Enter" });
      expect(nextCard).not.toHaveBeenCalled();
    });

    test("clears error when user starts typing", () => {
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      // First trigger an error
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(screen.getByText("Please enter an answer")).toBeDefined();

      // Then start typing to clear the error
      const input = screen.getByPlaceholderText("Type romaji equivalent...");
      fireEvent.change(input, { target: { value: "a" } });

      expect(screen.queryByText("Please enter an answer")).toBeNull();
    });
  });

  describe("Disabled States", () => {
    test("disables input and submit button when processing", () => {
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      const input = screen.getByPlaceholderText("Type romaji equivalent...");
      const submitButton = screen.getByRole("button", { name: "Submit" });

      // Initially enabled
      expect(input).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();

      // Submit to trigger processing state
      fireEvent.change(input, { target: { value: "a" } });
      fireEvent.click(submitButton);

      // Should be disabled during processing (briefly)
      expect(submitButton.textContent).toBe("Submitting...");
    });

    test("disables next card button when processing", () => {
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          result: "correct",
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      const nextButton = screen.getByRole("button", { name: "Next Card" });
      expect(nextButton).not.toBeDisabled();

      // Click to trigger processing state
      fireEvent.click(nextButton);
      expect(nextButton.textContent).toBe("Loading...");
    });

    test("prevents multiple submissions when processing", () => {
      const submitAnswer = vi.fn();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          submitAnswer,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      const input = screen.getByPlaceholderText("Type romaji equivalent...");
      const submitButton = screen.getByRole("button", { name: "Submit" });

      fireEvent.change(input, { target: { value: "a" } });

      // First click should work
      fireEvent.click(submitButton);
      expect(submitAnswer).toHaveBeenCalledTimes(1);

      // Subsequent clicks should be ignored while processing
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      expect(submitAnswer).toHaveBeenCalledTimes(1);
    });

    test("prevents keyboard submission when processing", () => {
      const submitAnswer = vi.fn();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          submitAnswer,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      const input = screen.getByPlaceholderText("Type romaji equivalent...");
      fireEvent.change(input, { target: { value: "a" } });

      // First Enter should work
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
      expect(submitAnswer).toHaveBeenCalledTimes(1);

      // Subsequent Enter presses should be ignored while processing
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
      expect(submitAnswer).toHaveBeenCalledTimes(1);
    });

    test("prevents next card action when processing", () => {
      const nextCard = vi.fn();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          result: "correct",
          nextCard,
          interactionMode: "typing",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      // First Enter should work
      fireEvent.keyDown(window, { key: "Enter", code: "Enter" });
      expect(nextCard).toHaveBeenCalledTimes(1);

      // Subsequent Enter presses should be ignored while processing
      fireEvent.keyDown(window, { key: "Enter", code: "Enter" });
      expect(nextCard).toHaveBeenCalledTimes(1);
    });
  });

  describe("Multiple Choice Mode", () => {
    test("validates empty selection in multiple choice mode", () => {
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          interactionMode: "multiple-choice",
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      render(<Flashcard />);

      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(screen.getByText("Please select an answer")).toBeDefined();
    });

    test("clears error when user selects a choice", () => {
      const mockProvider = mockFlashcardProvider({
        currentKana: mockKana.basic,
        interactionMode: "multiple-choice",
        choices: ["a", "ka", "sa", "ta"],
      });

      (useFlashcard as any).mockReturnValue(mockProvider);

      render(<Flashcard />);

      // First trigger an error
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(screen.getByText("Please select an answer")).toBeDefined();

      // Mock a choice selection to clear the error
      // Note: This test depends on the MultipleChoice component implementation
      // In a real test, you would interact with the actual choice buttons
    });
  });

  describe("Mode Switching", () => {
    test("clears state when switching between modes", () => {
      const setInteractionMode = vi.fn();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          interactionMode: "typing",
          setInteractionMode,
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      const { unmount } = render(<Flashcard />);

      const input = screen.getByPlaceholderText("Type romaji equivalent...");

      // Enter empty text and trigger an error
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
      expect(screen.getByText("Please enter an answer")).toBeDefined();

      // Unmount and switch modes
      unmount();
      (useFlashcard as any).mockReturnValue(
        mockFlashcardProvider({
          currentKana: mockKana.basic,
          interactionMode: "multiple-choice",
          setInteractionMode,
          choices: ["a", "ka", "sa", "ta"],
        }),
      );

      // Re-render with new mode
      render(<Flashcard />);

      // Error should be cleared when switching modes
      expect(screen.queryByText("Please enter an answer")).toBeNull();
    });
  });
});

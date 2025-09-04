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

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardInteraction } from "@/hooks/useFlashcardInteraction";
import { mockKanaData } from "../utils/mock-setup";
import type { KanaWithAccuracy, InteractionMode } from "@/types/common";

interface UseFlashcardInteractionProps {
  interactionMode: InteractionMode;
  result: "correct" | "incorrect" | null;
  isSubmitting: boolean;
  loadingKana: boolean;
  currentKana: KanaWithAccuracy | null;
  nextCard: () => void;
}

describe("useFlashcardInteraction Hook", () => {
  let mockNextCard: ReturnType<typeof vi.fn>;
  let mockSubmitAnswer: ReturnType<typeof vi.fn>;

  const defaultProps: UseFlashcardInteractionProps = {
    interactionMode: "typing",
    result: null,
    isSubmitting: false,
    loadingKana: false,
    currentKana: mockKanaData({ id: "1", character: "あ", romaji: "a" }),
    nextCard: vi.fn(),
  };

  beforeEach(() => {
    mockNextCard = vi.fn();
    mockSubmitAnswer = vi.fn().mockResolvedValue(undefined);
    // Mock HTMLInputElement.focus method
    HTMLInputElement.prototype.focus = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clear any event listeners
    document.removeEventListener("keydown", vi.fn());
  });

  describe("Initial State", () => {
    test("initializes with correct default state", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      expect(result.current.answer).toBe("");
      expect(result.current.selectedChoice).toBeNull();
      expect(result.current.error).toBe("");
      expect(result.current.inputRef.current).toBeNull();
    });

    test("provides state setters that work correctly", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      act(() => {
        result.current.setAnswer("test");
      });

      expect(result.current.answer).toBe("test");

      act(() => {
        result.current.setSelectedChoice(2);
      });

      expect(result.current.selectedChoice).toBe(2);

      act(() => {
        result.current.setError("test error");
      });

      expect(result.current.error).toBe("test error");
    });

    test("provides interactionState object with all values", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });
    });
  });

  describe("State Management (lines 45-58)", () => {
    test("setAnswer updates answer in interactionState", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      act(() => {
        result.current.setAnswer("new answer");
      });

      expect(result.current.interactionState.answer).toBe("new answer");
      expect(result.current.answer).toBe("new answer");
      expect(result.current.interactionState.selectedChoice).toBeNull();
      expect(result.current.interactionState.error).toBe("");
    });

    test("setSelectedChoice updates selectedChoice in interactionState", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      act(() => {
        result.current.setSelectedChoice(1);
      });

      expect(result.current.interactionState.selectedChoice).toBe(1);
      expect(result.current.selectedChoice).toBe(1);
      expect(result.current.interactionState.answer).toBe("");
      expect(result.current.interactionState.error).toBe("");
    });

    test("setError updates error in interactionState", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      act(() => {
        result.current.setError("validation error");
      });

      expect(result.current.interactionState.error).toBe("validation error");
      expect(result.current.error).toBe("validation error");
      expect(result.current.interactionState.answer).toBe("");
      expect(result.current.interactionState.selectedChoice).toBeNull();
    });

    test("multiple state updates work correctly together", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      act(() => {
        result.current.setAnswer("test");
        result.current.setSelectedChoice(2);
        result.current.setError("error");
      });

      expect(result.current.interactionState).toEqual({
        answer: "test",
        selectedChoice: 2,
        error: "error",
      });
    });
  });

  describe("Input Focus Management (lines 63-74)", () => {
    test("focuses input when all conditions are met for typing mode", () => {
      const mockFocus = vi.fn();
      
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            interactionMode: "typing",
            loadingKana: true, // Start with loading true
            result: null,
            isSubmitting: false,
          },
        },
      );

      // Simulate input ref being attached
      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      // Change loadingKana to false to trigger useEffect
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        interactionMode: "typing",
        loadingKana: false,
        result: null,
        isSubmitting: false,
      });

      expect(mockFocus).toHaveBeenCalled();
    });

    test("does not focus input when loadingKana is true", () => {
      const mockFocus = vi.fn();
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          loadingKana: true,
        }),
      );

      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      expect(mockFocus).not.toHaveBeenCalled();
    });

    test("does not focus input when currentKana is null", () => {
      const mockFocus = vi.fn();
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          currentKana: null,
        }),
      );

      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      expect(mockFocus).not.toHaveBeenCalled();
    });

    test("does not focus input when result is present", () => {
      const mockFocus = vi.fn();
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          result: "correct",
        }),
      );

      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      expect(mockFocus).not.toHaveBeenCalled();
    });

    test("does not focus input when isSubmitting is true", () => {
      const mockFocus = vi.fn();
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          isSubmitting: true,
        }),
      );

      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      expect(mockFocus).not.toHaveBeenCalled();
    });

    test("does not focus input when interactionMode is multiple-choice", () => {
      const mockFocus = vi.fn();
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "multiple-choice",
        }),
      );

      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      expect(mockFocus).not.toHaveBeenCalled();
    });

    test("focuses input when currentKana changes", () => {
      const mockFocus = vi.fn();
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            currentKana: mockKanaData({ id: "1", character: "あ", romaji: "a" }),
            interactionMode: "typing",
            loadingKana: false,
            result: null,
            isSubmitting: false,
          },
        },
      );

      // Simulate input ref being attached
      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      // Trigger initial useEffect by rerendering with same props
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        currentKana: mockKanaData({ id: "1", character: "あ", romaji: "a" }),
        interactionMode: "typing",
        loadingKana: false,
        result: null,
        isSubmitting: false,
      });

      expect(mockFocus).toHaveBeenCalledTimes(1); // Once for initial render

      // Change currentKana
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        currentKana: mockKanaData({ id: "2", character: "い", romaji: "i" }),
        interactionMode: "typing",
        loadingKana: false,
        result: null,
        isSubmitting: false,
      });

      expect(mockFocus).toHaveBeenCalledTimes(2); // Once for initial, once on change
    });

    test("focuses input when result changes from present to null", () => {
      const mockFocus = vi.fn();
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            result: "correct",
          },
        },
      );

      // Simulate input ref being attached
      act(() => {
        const mockInput = { focus: mockFocus } as unknown as HTMLInputElement;
        result.current.inputRef.current = mockInput;
      });

      // Should not focus initially due to result being present
      expect(mockFocus).not.toHaveBeenCalled();

      // Change result to null
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        result: null,
      });

      expect(mockFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe("Next Card Handling (lines 77-84)", () => {
    test("handleNextCard calls nextCard prop", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      act(() => {
        result.current.handleNextCard();
      });

      expect(mockNextCard).toHaveBeenCalledTimes(1);
    });

    test("handleNextCard resets interaction state", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({ ...defaultProps, nextCard: mockNextCard }),
      );

      // Set some state first
      act(() => {
        result.current.setAnswer("test answer");
        result.current.setSelectedChoice(1);
        result.current.setError("test error");
      });

      // Verify state is set
      expect(result.current.interactionState).toEqual({
        answer: "test answer",
        selectedChoice: 1,
        error: "test error",
      });

      // Handle next card
      act(() => {
        result.current.handleNextCard();
      });

      // Verify state is reset
      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });
    });

    test("handleNextCard is memoized correctly", () => {
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: { ...defaultProps, nextCard: mockNextCard },
        },
      );

      const initialHandler = result.current.handleNextCard;

      // Rerender with same nextCard
      rerender({ ...defaultProps, nextCard: mockNextCard });

      // Handler should be the same (memoized)
      expect(result.current.handleNextCard).toBe(initialHandler);

      // Rerender with different nextCard
      const newMockNextCard = vi.fn();
      rerender({ ...defaultProps, nextCard: newMockNextCard });

      // Handler should be different
      expect(result.current.handleNextCard).not.toBe(initialHandler);
    });
  });

  describe("Keyboard Event Handling (lines 87-96)", () => {
    test("handles Enter key when result is shown", () => {
      const { result: _result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          result: "correct",
          isSubmitting: false,
        }),
      );

      // Simulate Enter key press
      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Enter" });
        window.dispatchEvent(event);
      });

      expect(mockNextCard).toHaveBeenCalledTimes(1);
    });

    test("ignores Enter key when result is null", () => {
      const { result: _result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          result: null,
          isSubmitting: false,
        }),
      );

      // Simulate Enter key press
      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Enter" });
        window.dispatchEvent(event);
      });

      expect(mockNextCard).not.toHaveBeenCalled();
    });

    test("ignores Enter key when isSubmitting is true", () => {
      const { result: _result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          result: "correct",
          isSubmitting: true,
        }),
      );

      // Simulate Enter key press
      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Enter" });
        window.dispatchEvent(event);
      });

      expect(mockNextCard).not.toHaveBeenCalled();
    });

    test("ignores non-Enter keys", () => {
      const { result: _result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          result: "correct",
          isSubmitting: false,
        }),
      );

      // Simulate various other key presses
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Space" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      });

      expect(mockNextCard).not.toHaveBeenCalled();
    });

    test("removes event listener on cleanup", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          result: "correct",
        }),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });

    test("updates event handler when dependencies change", () => {
      const { rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            result: null,
            isSubmitting: false,
          },
        },
      );

      // Initially should not respond to Enter
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });
      expect(mockNextCard).not.toHaveBeenCalled();

      // Update to have result
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        result: "correct",
        isSubmitting: false,
      });

      // Now should respond to Enter
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });
      expect(mockNextCard).toHaveBeenCalledTimes(1);
    });
  });

  describe("Mode Switching Effect (lines 99-105)", () => {
    test("resets state when switching from typing to multiple-choice", () => {
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            interactionMode: "typing",
          },
        },
      );

      // Set some state
      act(() => {
        result.current.setAnswer("test");
        result.current.setSelectedChoice(1);
        result.current.setError("error");
      });

      expect(result.current.interactionState).toEqual({
        answer: "test",
        selectedChoice: 1,
        error: "error",
      });

      // Switch modes
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        interactionMode: "multiple-choice",
      });

      // State should be reset
      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });
    });

    test("resets state when switching from multiple-choice to typing", () => {
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            interactionMode: "multiple-choice",
          },
        },
      );

      // Set some state
      act(() => {
        result.current.setAnswer("test");
        result.current.setSelectedChoice(2);
        result.current.setError("error");
      });

      // Switch modes
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        interactionMode: "typing",
      });

      // State should be reset
      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });
    });

    test("does not reset state when mode does not change", () => {
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            interactionMode: "typing",
          },
        },
      );

      // Set some state
      act(() => {
        result.current.setAnswer("test");
        result.current.setSelectedChoice(1);
        result.current.setError("error");
      });

      const initialState = result.current.interactionState;

      // Rerender with same mode but different other props
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        interactionMode: "typing",
        result: "correct", // Change other prop
      });

      // State should remain the same
      expect(result.current.interactionState).toEqual(initialState);
    });
  });

  describe("Submit Handling Function (lines 107-133)", () => {
    const mockChoices = ["a", "i", "u", "e"];

    test("handles typing mode submission with valid answer", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
        }),
      );

      // Set answer
      act(() => {
        result.current.setAnswer("test answer");
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith("test answer");
      expect(result.current.error).toBe("");
    });

    test("handles typing mode submission with trimmed answer", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
        }),
      );

      // Set answer with whitespace
      act(() => {
        result.current.setAnswer("  trimmed answer  ");
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith("trimmed answer");
    });

    test("shows error for empty answer in typing mode", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
        }),
      );

      // Submit without setting answer
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).not.toHaveBeenCalled();
      expect(result.current.error).toBe("Please enter an answer");
    });

    test("shows error for whitespace-only answer in typing mode", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
        }),
      );

      // Set whitespace-only answer
      act(() => {
        result.current.setAnswer("   ");
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).not.toHaveBeenCalled();
      expect(result.current.error).toBe("Please enter an answer");
    });

    test("handles multiple-choice mode submission with valid selection", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "multiple-choice",
          isSubmitting: false,
        }),
      );

      // Select choice
      act(() => {
        result.current.setSelectedChoice(1);
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith("i"); // choices[1]
      expect(result.current.error).toBe("");
    });

    test("shows error for no selection in multiple-choice mode", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "multiple-choice",
          isSubmitting: false,
        }),
      );

      // Submit without selecting choice
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).not.toHaveBeenCalled();
      expect(result.current.error).toBe("Please select an answer");
    });

    test("handles multiple-choice mode with edge case choice indices", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "multiple-choice",
          isSubmitting: false,
        }),
      );

      // Test first choice (index 0)
      act(() => {
        result.current.setSelectedChoice(0);
      });

      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith("a"); // choices[0]

      // Test last choice (index 3)
      act(() => {
        result.current.setSelectedChoice(3);
      });

      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith("e"); // choices[3]
    });

    test("does not submit when isSubmitting is true", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: true,
        }),
      );

      // Set answer
      act(() => {
        result.current.setAnswer("test");
      });

      // Try to submit
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(mockSubmitAnswer).not.toHaveBeenCalled();
    });

    test("clears error before submitting", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
        }),
      );

      // Set an existing error
      act(() => {
        result.current.setError("previous error");
      });

      expect(result.current.error).toBe("previous error");

      // Set answer and submit
      act(() => {
        result.current.setAnswer("test");
      });

      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, mockChoices);
      });

      expect(result.current.error).toBe("");
      expect(mockSubmitAnswer).toHaveBeenCalledWith("test");
    });

    test("handles submitAnswer promise rejection", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
        }),
      );

      const mockFailingSubmit = vi.fn().mockRejectedValue(new Error("Submit failed"));

      // Set answer
      act(() => {
        result.current.setAnswer("test");
      });

      // Submit should not throw but let the error bubble up
      await expect(
        act(async () => {
          await result.current.handleSubmit(mockFailingSubmit, mockChoices);
        })
      ).rejects.toThrow("Submit failed");

      expect(mockFailingSubmit).toHaveBeenCalledWith("test");
    });
  });

  describe("Choice Selection Function (lines 135-139)", () => {
    test("sets selected choice when not submitting and no result", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          isSubmitting: false,
          result: null,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(2);
      });

      expect(result.current.selectedChoice).toBe(2);
    });

    test("clears error when selecting choice", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          isSubmitting: false,
          result: null,
        }),
      );

      // Set an error first
      act(() => {
        result.current.setError("test error");
      });

      expect(result.current.error).toBe("test error");

      // Select choice
      act(() => {
        result.current.handleChoiceSelect(1);
      });

      expect(result.current.error).toBe("");
      expect(result.current.selectedChoice).toBe(1);
    });

    test("does not set choice when isSubmitting is true", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          isSubmitting: true,
          result: null,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(1);
      });

      expect(result.current.selectedChoice).toBeNull();
    });

    test("does not set choice when result is present", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          isSubmitting: false,
          result: "correct",
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(1);
      });

      expect(result.current.selectedChoice).toBeNull();
    });

    test("handles edge case choice indices", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          isSubmitting: false,
          result: null,
        }),
      );

      // Test index 0
      act(() => {
        result.current.handleChoiceSelect(0);
      });
      expect(result.current.selectedChoice).toBe(0);

      // Test negative index (shouldn't be used in practice but should work)
      act(() => {
        result.current.handleChoiceSelect(-1);
      });
      expect(result.current.selectedChoice).toBe(-1);

      // Test large index
      act(() => {
        result.current.handleChoiceSelect(999);
      });
      expect(result.current.selectedChoice).toBe(999);
    });

    test("handles multiple consecutive selections", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          isSubmitting: false,
          result: null,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(0);
      });
      expect(result.current.selectedChoice).toBe(0);

      act(() => {
        result.current.handleChoiceSelect(2);
      });
      expect(result.current.selectedChoice).toBe(2);

      act(() => {
        result.current.handleChoiceSelect(1);
      });
      expect(result.current.selectedChoice).toBe(1);
    });
  });

  describe("Integration Tests", () => {
    test("complete typing mode workflow", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
          result: null,
        }),
      );

      // Set answer
      act(() => {
        result.current.setAnswer("test answer");
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, ["a", "b", "c"]);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith("test answer");

      // Handle next card
      act(() => {
        result.current.handleNextCard();
      });

      expect(mockNextCard).toHaveBeenCalled();
      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });
    });

    test("complete multiple-choice mode workflow", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "multiple-choice",
          isSubmitting: false,
          result: null,
        }),
      );

      const choices = ["a", "i", "u", "e"];

      // Select choice
      act(() => {
        result.current.handleChoiceSelect(1);
      });

      expect(result.current.selectedChoice).toBe(1);

      // Submit
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, choices);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith("i");

      // Handle next card
      act(() => {
        result.current.handleNextCard();
      });

      expect(mockNextCard).toHaveBeenCalled();
      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });
    });

    test("error handling and recovery workflow", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "typing",
          isSubmitting: false,
          result: null,
        }),
      );

      // Try to submit without answer
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, []);
      });

      expect(result.current.error).toBe("Please enter an answer");
      expect(mockSubmitAnswer).not.toHaveBeenCalled();

      // Set answer to fix error
      act(() => {
        result.current.setAnswer("correct answer");
      });

      // Submit successfully
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, []);
      });

      expect(result.current.error).toBe("");
      expect(mockSubmitAnswer).toHaveBeenCalledWith("correct answer");
    });

    test("mode switching workflow", () => {
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: {
            ...defaultProps,
            nextCard: mockNextCard,
            interactionMode: "typing",
          },
        },
      );

      // Set some state in typing mode
      act(() => {
        result.current.setAnswer("typed answer");
        result.current.setError("typing error");
      });

      // Switch to multiple-choice mode
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        interactionMode: "multiple-choice",
      });

      // State should be reset
      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });

      // Select choice in multiple-choice mode
      act(() => {
        result.current.handleChoiceSelect(2);
      });

      expect(result.current.selectedChoice).toBe(2);

      // Switch back to typing mode
      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        interactionMode: "typing",
      });

      // State should be reset again
      expect(result.current.interactionState).toEqual({
        answer: "",
        selectedChoice: null,
        error: "",
      });
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    test("handles rapid successive state changes", () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
        }),
      );

      act(() => {
        result.current.setAnswer("1");
        result.current.setAnswer("2");
        result.current.setAnswer("3");
        result.current.setSelectedChoice(0);
        result.current.setSelectedChoice(1);
        result.current.setSelectedChoice(2);
        result.current.setError("error1");
        result.current.setError("error2");
      });

      expect(result.current.interactionState).toEqual({
        answer: "3",
        selectedChoice: 2,
        error: "error2",
      });
    });

    test("handles undefined/null choices array", async () => {
      const { result } = renderHook(() =>
        useFlashcardInteraction({
          ...defaultProps,
          nextCard: mockNextCard,
          interactionMode: "multiple-choice",
        }),
      );

      act(() => {
        result.current.setSelectedChoice(0);
      });

      // This should handle gracefully when choices is undefined/empty
      await act(async () => {
        await result.current.handleSubmit(mockSubmitAnswer, []);
      });

      expect(mockSubmitAnswer).toHaveBeenCalledWith(undefined); // choices[0] when choices is empty
    });

    test("preserves inputRef across rerenders", () => {
      const { result, rerender } = renderHook(
        (props: UseFlashcardInteractionProps) =>
          useFlashcardInteraction(props),
        {
          initialProps: { ...defaultProps, nextCard: mockNextCard },
        },
      );

      const initialRef = result.current.inputRef;

      rerender({
        ...defaultProps,
        nextCard: mockNextCard,
        result: "correct",
      });

      expect(result.current.inputRef).toBe(initialRef);
    });
  });
});
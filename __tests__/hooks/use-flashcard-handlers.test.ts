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

import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardHandlers } from "../../hooks/useFlashcardHandlers";

describe("useFlashcardHandlers Hook", () => {
  const mockSetInteractionMode = vi.fn();
  const mockSetSelectedChoice = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleModeChange", () => {
    test("should call setInteractionMode when not blocked", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: null,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleModeChange("multiple-choice");
      });

      expect(mockSetInteractionMode).toHaveBeenCalledWith("multiple-choice");
    });

    test("should not call setInteractionMode when isSubmitting is true", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: true,
          result: null,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleModeChange("typing");
      });

      expect(mockSetInteractionMode).not.toHaveBeenCalled();
    });

    test("should not call setInteractionMode when result is correct", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: "correct",
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleModeChange("typing");
      });

      expect(mockSetInteractionMode).not.toHaveBeenCalled();
    });

    test("should not call setInteractionMode when result is incorrect", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: "incorrect",
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleModeChange("multiple-choice");
      });

      expect(mockSetInteractionMode).not.toHaveBeenCalled();
    });

    test("should not call setInteractionMode when both isSubmitting and result are true", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: true,
          result: "correct",
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleModeChange("typing");
      });

      expect(mockSetInteractionMode).not.toHaveBeenCalled();
    });

    test("should handle multiple mode changes when allowed", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: null,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleModeChange("multiple-choice");
        result.current.handleModeChange("typing");
        result.current.handleModeChange("multiple-choice");
      });

      expect(mockSetInteractionMode).toHaveBeenCalledTimes(3);
      expect(mockSetInteractionMode).toHaveBeenNthCalledWith(
        1,
        "multiple-choice",
      );
      expect(mockSetInteractionMode).toHaveBeenNthCalledWith(2, "typing");
      expect(mockSetInteractionMode).toHaveBeenNthCalledWith(
        3,
        "multiple-choice",
      );
    });
  });

  describe("handleChoiceSelect", () => {
    test("should call setSelectedChoice and setError when not blocked", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: null,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(2);
      });

      expect(mockSetSelectedChoice).toHaveBeenCalledWith(2);
      expect(mockSetError).toHaveBeenCalledWith("");
    });

    test("should not call setSelectedChoice when isSubmitting is true", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: true,
          result: null,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(0);
      });

      expect(mockSetSelectedChoice).not.toHaveBeenCalled();
      expect(mockSetError).not.toHaveBeenCalled();
    });

    test("should not call setSelectedChoice when result is correct", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: "correct",
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(1);
      });

      expect(mockSetSelectedChoice).not.toHaveBeenCalled();
      expect(mockSetError).not.toHaveBeenCalled();
    });

    test("should not call setSelectedChoice when result is incorrect", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: "incorrect",
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(3);
      });

      expect(mockSetSelectedChoice).not.toHaveBeenCalled();
      expect(mockSetError).not.toHaveBeenCalled();
    });

    test("should handle multiple choice selections when allowed", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: null,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(0);
        result.current.handleChoiceSelect(1);
        result.current.handleChoiceSelect(2);
      });

      expect(mockSetSelectedChoice).toHaveBeenCalledTimes(3);
      expect(mockSetSelectedChoice).toHaveBeenNthCalledWith(1, 0);
      expect(mockSetSelectedChoice).toHaveBeenNthCalledWith(2, 1);
      expect(mockSetSelectedChoice).toHaveBeenNthCalledWith(3, 2);
      expect(mockSetError).toHaveBeenCalledTimes(3);
      expect(mockSetError).toHaveBeenCalledWith("");
    });

    test("should clear error when selecting choice", () => {
      const { result } = renderHook(() =>
        useFlashcardHandlers({
          isSubmitting: false,
          result: null,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      );

      act(() => {
        result.current.handleChoiceSelect(1);
      });

      expect(mockSetError).toHaveBeenCalledWith("");
    });
  });

  test("should memoize handlers correctly", () => {
    const { result, rerender } = renderHook(
      ({ isSubmitting, result }) =>
        useFlashcardHandlers({
          isSubmitting,
          result,
          setInteractionMode: mockSetInteractionMode,
          setSelectedChoice: mockSetSelectedChoice,
          setError: mockSetError,
        }),
      {
        initialProps: { isSubmitting: false, result: null },
      },
    );

    const initialHandlers = result.current;

    // Rerender with same props
    rerender({ isSubmitting: false, result: null });
    const samePropsHandlers = result.current;

    expect(initialHandlers.handleModeChange).toBe(
      samePropsHandlers.handleModeChange,
    );
    expect(initialHandlers.handleChoiceSelect).toBe(
      samePropsHandlers.handleChoiceSelect,
    );

    // Rerender with different props
    rerender({ isSubmitting: true, result: null });
    const differentPropsHandlers = result.current;

    expect(initialHandlers.handleModeChange).not.toBe(
      differentPropsHandlers.handleModeChange,
    );
    expect(initialHandlers.handleChoiceSelect).not.toBe(
      differentPropsHandlers.handleChoiceSelect,
    );
  });
});

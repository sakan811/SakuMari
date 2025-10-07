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

import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardHandlers } from "../../hooks/useFlashcardHandlers";

describe("useFlashcardHandlers", () => {
  const mockSetInteractionMode = vi.fn();
  const mockSetError = vi.fn();
  const mockSetSelectedChoice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should handle mode change when not submitting and no result", () => {
    const { result } = renderHook(() =>
      useFlashcardHandlers({
        isSubmitting: false,
        result: null,
        interactionMode: "typing",
        setInteractionMode: mockSetInteractionMode,
        setError: mockSetError,
        selectedChoice: null,
        setSelectedChoice: mockSetSelectedChoice,
      }),
    );

    act(() => {
      result.current.handleModeChange("multiple-choice");
    });

    expect(mockSetInteractionMode).toHaveBeenCalledWith("multiple-choice");
    expect(mockSetError).not.toHaveBeenCalled();
  });

  test("should not handle mode change when submitting", () => {
    const { result } = renderHook(() =>
      useFlashcardHandlers({
        isSubmitting: true,
        result: null,
        interactionMode: "typing",
        setInteractionMode: mockSetInteractionMode,
        setError: mockSetError,
        selectedChoice: null,
        setSelectedChoice: mockSetSelectedChoice,
      }),
    );

    act(() => {
      result.current.handleModeChange("multiple-choice");
    });

    expect(mockSetInteractionMode).not.toHaveBeenCalled();
  });

  test("should not handle mode change when there is a result", () => {
    const { result } = renderHook(() =>
      useFlashcardHandlers({
        isSubmitting: false,
        result: { correct: true, correctAnswer: "test" },
        interactionMode: "typing",
        setInteractionMode: mockSetInteractionMode,
        setError: mockSetError,
        selectedChoice: null,
        setSelectedChoice: mockSetSelectedChoice,
      }),
    );

    act(() => {
      result.current.handleModeChange("multiple-choice");
    });

    expect(mockSetInteractionMode).not.toHaveBeenCalled();
  });

  test("should handle choice selection when not submitting and no result", () => {
    const { result } = renderHook(() =>
      useFlashcardHandlers({
        isSubmitting: false,
        result: null,
        interactionMode: "multiple-choice",
        setInteractionMode: mockSetInteractionMode,
        setError: mockSetError,
        selectedChoice: null,
        setSelectedChoice: mockSetSelectedChoice,
      }),
    );

    act(() => {
      result.current.handleChoiceSelect(2);
    });

    expect(mockSetSelectedChoice).toHaveBeenCalledWith(2);
    expect(mockSetError).toHaveBeenCalledWith("");
  });

  test("should not handle choice selection when submitting", () => {
    const { result } = renderHook(() =>
      useFlashcardHandlers({
        isSubmitting: true,
        result: null,
        interactionMode: "multiple-choice",
        setInteractionMode: mockSetInteractionMode,
        setError: mockSetError,
        selectedChoice: null,
        setSelectedChoice: mockSetSelectedChoice,
      }),
    );

    act(() => {
      result.current.handleChoiceSelect(2);
    });

    expect(mockSetSelectedChoice).not.toHaveBeenCalled();
  });

  test("should not handle choice selection when there is a result", () => {
    const { result } = renderHook(() =>
      useFlashcardHandlers({
        isSubmitting: false,
        result: { correct: true, correctAnswer: "test" },
        interactionMode: "multiple-choice",
        setInteractionMode: mockSetInteractionMode,
        setError: mockSetError,
        selectedChoice: null,
        setSelectedChoice: mockSetSelectedChoice,
      }),
    );

    act(() => {
      result.current.handleChoiceSelect(2);
    });

    expect(mockSetSelectedChoice).not.toHaveBeenCalled();
  });
});
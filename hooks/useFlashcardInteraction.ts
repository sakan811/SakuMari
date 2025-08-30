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

import { useState, useEffect, useRef } from "react";

type InteractionMode = "typing" | "multiple-choice";

interface UseFlashcardInteractionProps {
  interactionMode: InteractionMode;
  result: "correct" | "incorrect" | null;
  isSubmitting: boolean;
  loadingKana: boolean;
  currentKana: any;
  nextCard: () => void;
}

/**
 * Custom hook for managing flashcard interaction state and effects
 * @param props - Flashcard interaction properties
 * @returns Object containing interaction state and handlers
 */
export function useFlashcardInteraction({
  interactionMode,
  result,
  isSubmitting,
  loadingKana,
  currentKana,
  nextCard,
}: UseFlashcardInteractionProps) {
  // Interaction state
  const [interactionState, setInteractionState] = useState({
    answer: "",
    selectedChoice: null as number | null,
    error: "",
  });

  const { answer, selectedChoice, error } = interactionState;
  const setAnswer = (value: string) =>
    setInteractionState((prev) => ({ ...prev, answer: value }));
  const setSelectedChoice = (value: number | null) =>
    setInteractionState((prev) => ({ ...prev, selectedChoice: value }));
  const setError = (value: string) =>
    setInteractionState((prev) => ({ ...prev, error: value }));

  // Input ref for focus management
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts, when card changes, or after result is cleared
  useEffect(() => {
    if (
      inputRef.current &&
      !loadingKana &&
      currentKana &&
      !result &&
      !isSubmitting &&
      interactionMode === "typing"
    ) {
      inputRef.current.focus();
    }
  }, [currentKana, loadingKana, result, isSubmitting, interactionMode]);

  // Handle Enter key when result is shown
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && result && !isSubmitting) {
        handleNextCard();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [result, isSubmitting]);

  // Clear state when switching modes
  useEffect(() => {
    setInteractionState({
      answer: "",
      selectedChoice: null,
      error: "",
    });
  }, [interactionMode]);

  const handleNextCard = () => {
    nextCard();
    setInteractionState({
      answer: "",
      selectedChoice: null,
      error: "",
    });
  };

  const handleSubmit = async (
    submitAnswer: (answer: string) => Promise<void>,
    choices: string[],
  ) => {
    if (isSubmitting) return;

    let userAnswer: string;

    if (interactionMode === "typing") {
      // Validate the answer isn't empty
      if (!answer.trim()) {
        setError("Please enter an answer");
        return;
      }
      userAnswer = answer.trim();
    } else {
      // Multiple choice validation
      if (selectedChoice === null) {
        setError("Please select an answer");
        return;
      }
      userAnswer = choices[selectedChoice];
    }

    setError(""); // Clear any previous errors
    await submitAnswer(userAnswer);
  };

  const handleChoiceSelect = (index: number) => {
    if (isSubmitting || result) return;
    setSelectedChoice(index);
    setError("");
  };

  return {
    // State
    answer,
    setAnswer,
    selectedChoice,
    setSelectedChoice,
    error,
    setError,
    interactionState,
    setInteractionState,

    // Refs
    inputRef,

    // Handlers
    handleNextCard,
    handleSubmit,
    handleChoiceSelect,
  };
}

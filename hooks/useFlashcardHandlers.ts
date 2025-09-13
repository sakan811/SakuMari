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

import { useCallback } from "react";
import type { InteractionMode } from "@/types/common";

interface UseFlashcardHandlersProps {
  isSubmitting: boolean;
  result: "correct" | "incorrect" | null;
  setInteractionMode: (mode: InteractionMode) => void;
  setSelectedChoice: (index: number | null) => void;
  setError: (error: string) => void;
}

interface UseFlashcardHandlersReturn {
  handleModeChange: (mode: InteractionMode) => void;
  handleChoiceSelect: (index: number) => void;
}

export function useFlashcardHandlers({
  isSubmitting,
  result,
  setInteractionMode,
  setSelectedChoice,
  setError,
}: UseFlashcardHandlersProps): UseFlashcardHandlersReturn {
  const handleModeChange = useCallback((mode: InteractionMode) => {
    if (isSubmitting || result) return;
    setInteractionMode(mode);
    // State will be cleared by useEffect
  }, [isSubmitting, result, setInteractionMode]);

  const handleChoiceSelect = useCallback((index: number) => {
    if (isSubmitting || result) return;
    setSelectedChoice(index);
    setError("");
  }, [isSubmitting, result, setSelectedChoice, setError]);

  return {
    handleModeChange,
    handleChoiceSelect,
  };
}
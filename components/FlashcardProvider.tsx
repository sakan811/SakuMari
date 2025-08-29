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

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { isKanaType } from "@/lib/kana-utils";
import { InteractionMode } from "@/types/kana";

type KanaWithAccuracy = {
  id: string;
  character: string;
  romaji: string;
  accuracy: number;
  attempts: number;
  correct_attempts: number;
};

type FlashcardContextType = {
  currentKana: KanaWithAccuracy | null;
  loadingKana: boolean;
  submitAnswer: (answer: string) => Promise<void>;
  result: "correct" | "incorrect" | null;
  nextCard: () => void;
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
  choices: string[];
  isSubmitting: boolean;
};

const FlashcardContext = createContext<FlashcardContextType | undefined>(
  undefined,
);

export function useFlashcard() {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error("useFlashcard must be used within a FlashcardProvider");
  }
  return context;
}

export function FlashcardProvider({
  children,
  kanaType,
}: {
  children: React.ReactNode;
  kanaType?: "hiragana" | "katakana";
}) {
  const [kanaList, setKanaList] = useState<KanaWithAccuracy[]>([]);
  const [currentKana, setCurrentKana] = useState<KanaWithAccuracy | null>(null);
  const [loadingKana, setLoadingKana] = useState(true);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("typing");
  const [choices, setChoices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetched = useRef(false);

  // Generate choices for multiple choice mode
  const generateChoices = useCallback((
    correctKana: KanaWithAccuracy,
    kanaData: KanaWithAccuracy[],
  ) => {
    if (!kanaData.length) {
      setChoices([]);
      return;
    }

    const correctAnswer = correctKana.romaji;

    // Get all possible wrong answers
    const wrongAnswers = kanaData
      .filter((kana) => kana.romaji !== correctAnswer)
      .map((kana) => kana.romaji);

    // Remove duplicates
    const uniqueWrongAnswers = [...new Set(wrongAnswers)];

    // Shuffle and take 3 wrong answers
    const selectedWrongAnswers = uniqueWrongAnswers
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // If we don't have enough wrong answers, fill with what we have
    while (
      selectedWrongAnswers.length < 3 &&
      selectedWrongAnswers.length < uniqueWrongAnswers.length
    ) {
      const remaining = uniqueWrongAnswers.filter(
        (answer) => !selectedWrongAnswers.includes(answer),
      );
      if (remaining.length > 0) {
        selectedWrongAnswers.push(remaining[0]);
      } else {
        break;
      }
    }

    // Combine correct answer with wrong answers and shuffle
    const allChoices = [correctAnswer, ...selectedWrongAnswers].sort(
      () => Math.random() - 0.5,
    );

    setChoices(allChoices);
  }, [setChoices]);

  // Select a kana using confidence-weighted selection (solves first-success penalty)
  const selectRandomKana = useCallback((data: KanaWithAccuracy[]) => {
    if (!data.length) return;

    // Calculate confidence-aware weights
    const weights = data.map((kana) => {
      // New characters get high priority
      if (kana.attempts === 0) return 2.0;

      // Base weight from accuracy (lower accuracy = higher weight)
      const accuracyWeight = Math.max(1 - kana.accuracy, 0.1);

      // Confidence boost for high accuracy + few attempts (prevents first-success penalty)
      const confidenceBoost =
        kana.attempts < 3 && kana.accuracy > 0.8
          ? 1 + (3 - kana.attempts) * 0.5
          : 1;

      return accuracyWeight * confidenceBoost;
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selectedKana = null;

    for (let i = 0; i < data.length; i++) {
      randomVal -= weights[i];
      if (randomVal <= 0) {
        selectedKana = data[i];
        break;
      }
    }

    // Fallback: if no kana was selected, select the last one
    if (!selectedKana) {
      selectedKana = data[data.length - 1];
    }

    setCurrentKana(selectedKana);
    generateChoices(selectedKana, data);
  }, [setCurrentKana, generateChoices]);

  const fetchKanaData = useCallback(async () => {
    setLoadingKana(true);
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch kana data");
      }
      let data = await response.json();

      // Ensure data is an array before filtering
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }

      // Filter by kana type if specified
      if (kanaType) {
        data = data.filter((kana: KanaWithAccuracy) => {
          return isKanaType(kana.character, kanaType);
        });
      }

      setKanaList(data);
      selectRandomKana(data);
    } catch (error) {
      console.error("Error fetching kana data:", error);
    } finally {
      setLoadingKana(false);
    }
  }, [kanaType, selectRandomKana, setKanaList, setLoadingKana]);

  // Prevent double fetch in React strict mode
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchKanaData();
    }
  }, [kanaType, fetchKanaData]);

  // Submit answer and update accuracy
  const submitAnswer = async (answer: string) => {
    if (!currentKana || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const isCorrect =
        answer.trim().toLowerCase() === currentKana.romaji.toLowerCase();

      // Submit to API first
      const response = await fetch("/api/flashcards/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kanaId: currentKana.id,
          isCorrect,
          interactionMode, // Track which mode was used
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Only set result after successful API submission
      setResult(isCorrect ? "correct" : "incorrect");
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Show error state but still allow user to continue
      setResult("incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Proceed to next kana
  const nextCard = () => {
    setResult(null);
    selectRandomKana(kanaList);
  };

  const value = {
    currentKana,
    loadingKana,
    submitAnswer,
    result,
    nextCard,
    interactionMode,
    setInteractionMode,
    choices,
    isSubmitting,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

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

import type { KanaWithAccuracy, InteractionMode } from "@/types/common";
import {
  calculateKanaWeights,
  selectKanaByWeight,
  generateChoicesArray,
  filterKanaByType,
  shouldPreventSubmission,
} from "@/lib/flashcard-utils";

export type FlashcardContextType = {
  currentKana: KanaWithAccuracy | null;
  loadingKana: boolean;
  submitAnswer: (_: string) => Promise<void>;
  result: "correct" | "incorrect" | null;
  nextCard: () => void;
  interactionMode: InteractionMode;
  setInteractionMode: (_: InteractionMode) => void;
  choices: string[];
  isSubmitting: boolean;
  generateChoicesArray: (_: KanaWithAccuracy, __: KanaWithAccuracy[]) => string[];
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

  // Select a kana using confidence-weighted selection (solves first-success penalty)
  const selectRandomKana = useCallback((data: KanaWithAccuracy[]) => {
    if (!data.length) {
      setCurrentKana(null);
      setChoices([]);
      return;
    }

    const weights = calculateKanaWeights(data);
    const selectedKana = selectKanaByWeight(data, weights);

    setCurrentKana(selectedKana);
    const choices = generateChoicesArray(selectedKana, data);
    setChoices(choices);
  }, []);

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
      data = filterKanaByType(data, kanaType);

      setKanaList(data);
      selectRandomKana(data);
    } catch (error) {
      console.error("Error fetching kana data:", error);
    } finally {
      setLoadingKana(false);
    }
  }, [kanaType, selectRandomKana]);

  // Prevent double fetch in React strict mode
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchKanaData();
    } else if (kanaType) {
      // If kanaType changes, fetch new data
      fetchKanaData();
    }
  }, [kanaType, fetchKanaData]);

  
  // Submit answer and update accuracy
  const submitAnswer = async (answer: string) => {
    if (shouldPreventSubmission(currentKana, isSubmitting)) return;

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
    generateChoicesArray,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

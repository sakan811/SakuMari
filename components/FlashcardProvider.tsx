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
import { shouldFetchKanaData } from "@/lib/should-fetch-kana-data";

export type FlashcardContextType = {
  currentKana: KanaWithAccuracy | null;
  kanaData: KanaWithAccuracy[];
  loadingKana: boolean;
  submitAnswer: (_: string) => Promise<void>;
  result: "correct" | "incorrect" | null;
  nextCard: () => void;
  interactionMode: InteractionMode;
  setInteractionMode: (_: InteractionMode) => void;
  choices: string[];
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
  generateChoicesArray: (
    _: KanaWithAccuracy,
    __: KanaWithAccuracy[],
  ) => string[];
  kanaType?: "hiragana" | "katakana";
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
  _resetHasFetched = false,
}: {
  children: React.ReactNode;
  kanaType?: "hiragana" | "katakana";
  _resetHasFetched?: boolean; // For testing only
}) {
  const [kanaList, setKanaList] = useState<KanaWithAccuracy[]>([]);
  const [currentKana, setCurrentKana] = useState<KanaWithAccuracy | null>(null);
  const [loadingKana, setLoadingKana] = useState(true);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("typing");
  const [choices, setChoices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(_resetHasFetched ? false : true);

  const fetchKanaData = useCallback(async () => {
    setLoadingKana(true);
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch kana data");
      }
      let data = await response.json();

      // Handle null/undefined response
      if (!data) {
        data = [];
      }

      // Ensure data is an array before filtering
      if (!Array.isArray(data)) {
        data = [];
      }

      // Filter by kana type if specified
      data = filterKanaByType(data, kanaType);

      setKanaList(data);

      // Select a kana using confidence-weighted selection (solves first-success penalty)
      if (!data.length) {
        setCurrentKana(null);
        setChoices([]);
      } else {
        const weights = calculateKanaWeights(data);
        const selectedKana = selectKanaByWeight(data, weights);
        setCurrentKana(selectedKana);
        const choices = generateChoicesArray(selectedKana, data);
        setChoices(choices);
      }
    } catch (error) {
      console.error("Error fetching kana data:", error);
      // Set empty data on error
      setKanaList([]);
      setCurrentKana(null);
      setChoices([]);
    } finally {
      setLoadingKana(false);
    }
  }, [kanaType]);

  // Handle data fetching logic
  const handleDataFetch = useCallback(() => {
    if (shouldFetchKanaData(hasFetched.current, kanaType)) {
      hasFetched.current = true;
      fetchKanaData();
    }
    // This empty block is the false branch that needs coverage
  }, [kanaType, fetchKanaData]);

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

  // Prevent double fetch in React strict mode
  useEffect(() => {
    handleDataFetch();
  }, [handleDataFetch]);

  // Submit answer and update accuracy
  const submitAnswer = useCallback(
    async (answer: string) => {
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
          if (response.status === 401) {
            try {
              const errorData = await response.json();
              setError(errorData.message || "Authentication required");
              return;
            } catch {
              setError("Authentication required");
              return;
            }
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Clear any previous error on successful submission
        setError(null);
        setResult(isCorrect ? "correct" : "incorrect");
      } catch (error) {
        console.error("Error submitting answer:", error);
        setError(
          error instanceof Error ? error.message : "Failed to submit answer",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentKana, isSubmitting, interactionMode],
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Proceed to next kana
  const nextCard = useCallback(() => {
    setResult(null);
    setError(null);
    selectRandomKana(kanaList);
  }, [kanaList, selectRandomKana]);

  const handleSetInteractionMode = (mode: InteractionMode) => {
    // Simple implementation for now - we'll add choice generation logic back if needed
    setInteractionMode(mode);
  };

  const value = {
    currentKana,
    kanaData: kanaList,
    loadingKana,
    submitAnswer,
    result,
    nextCard,
    interactionMode,
    setInteractionMode: handleSetInteractionMode,
    choices,
    isSubmitting,
    error,
    clearError,
    generateChoicesArray,
    kanaType,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

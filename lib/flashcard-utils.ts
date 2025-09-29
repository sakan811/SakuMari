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

import type { KanaWithAccuracy } from "@/types/common";

/**
 * Calculate confidence-aware weights for kana selection
 * Implements the confidence-weighted selection algorithm
 */
export function calculateKanaWeights(kanaList: KanaWithAccuracy[]): number[] {
  return kanaList.map((kana) => {
    // New characters get high priority (line 84)
    if (kana.attempts === 0) return 2.0;

    // Base weight from accuracy (lower accuracy = higher weight) (lines 87-88)
    const accuracyWeight = Math.max(1 - kana.accuracy, 0.1);

    // Confidence boost for high accuracy + few attempts (prevents first-success penalty) (lines 90-93)
    const confidenceBoost =
      kana.attempts < 3 && kana.accuracy > 0.8
        ? 1 + (3 - kana.attempts) * 0.5
        : 1;

    return accuracyWeight * confidenceBoost;
  });
}

/**
 * Select a kana using weighted random selection based on confidence weights
 */
export function selectKanaByWeight(
  kanaList: KanaWithAccuracy[],
  weights: number[],
): KanaWithAccuracy | null {
  if (
    !kanaList.length ||
    !weights.length ||
    kanaList.length !== weights.length
  ) {
    return null;
  }

  // Weighted random selection (lines 99-109)
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let randomVal = Math.random() * totalWeight;
  let selectedKana = null;

  for (let i = 0; i < kanaList.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0) {
      selectedKana = kanaList[i];
      break;
    }
  }

  // Fallback: if no kana was selected, select the last one (lines 112-114)
  if (!selectedKana) {
    selectedKana = kanaList[kanaList.length - 1];
  }

  return selectedKana;
}

/**
 * Generate choices array for multiple choice mode
 */
export function generateChoicesArray(
  correctKana: KanaWithAccuracy,
  kanaData: KanaWithAccuracy[],
): string[] {
  if (!kanaData.length) {
    return [];
  }

  const correctAnswer = correctKana.romaji;

  // Get unique wrong answers from other kana (exclude duplicates)
  const uniqueWrongAnswers = Array.from(
    new Set(
      kanaData
        .filter((kana) => kana.romaji !== correctAnswer)
        .map((kana) => kana.romaji),
    ),
  )
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Combine correct answer with wrong answers and shuffle
  const allChoices = [correctAnswer, ...uniqueWrongAnswers].sort(
    () => Math.random() - 0.5,
  );

  return allChoices;
}

/**
 * Filter kana data by type (hiragana/katakana)
 */
export function filterKanaByType(
  kanaData: KanaWithAccuracy[],
  kanaType?: "hiragana" | "katakana",
): KanaWithAccuracy[] {
  if (!kanaType) {
    return kanaData;
  }

  return kanaData.filter((kana) => {
    const isHiragana =
      kana.character.charCodeAt(0) >= 0x3040 &&
      kana.character.charCodeAt(0) <= 0x309f;
    return kanaType === "hiragana" ? isHiragana : !isHiragana;
  });
}

/**
 * Check if answer submission should be prevented
 */
export function shouldPreventSubmission(
  currentKana: KanaWithAccuracy | null,
  isSubmitting: boolean,
): boolean {
  return !currentKana || isSubmitting;
}

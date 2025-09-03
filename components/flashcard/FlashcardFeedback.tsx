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

import React from "react";
import { useFlashcard } from "../FlashcardProvider";
import type { KanaWithAccuracy } from "@/types/common";

interface FlashcardFeedbackProps {
  onNextCard: () => void;
  isSubmitting: boolean;
}

export default function FlashcardFeedback({
  onNextCard,
  isSubmitting,
}: FlashcardFeedbackProps) {
  const { result, currentKana } = useFlashcard();

  if (!result || !currentKana) return null;

  return (
    <div className="w-full">
      <div
        className={`mb-3 sm:mb-4 rounded-md p-2 sm:p-3 text-center border-2 ${
          result === "correct"
            ? "bg-green-50 text-green-800 border-green-300"
            : "bg-[#ae0d13] text-white border-[#950a1e]"
        }`}
      >
        <p className="text-sm sm:text-lg font-semibold">
          {result === "correct" ? "Correct!" : "Incorrect!"}
        </p>
        <p className="text-xs sm:text-base">
          The correct answer is: <strong>{currentKana.romaji}</strong>
        </p>
      </div>
      <button
        onClick={onNextCard}
        disabled={isSubmitting}
        className={`w-full rounded-md px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-white transition-all duration-200 border-2 ${
          isSubmitting
            ? "bg-[#705a39] cursor-not-allowed border-[#705a39]"
            : "bg-[#d1622b] hover:bg-[#ae0d13] border-[#d1622b] hover:border-[#ae0d13] shadow-lg hover:shadow-xl transform hover:scale-105"
        }`}
      >
        {isSubmitting ? "Loading..." : "Next Card"}
      </button>
    </div>
  );
}
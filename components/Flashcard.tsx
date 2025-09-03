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

import React, { useEffect } from "react";
import { useFlashcard } from "./FlashcardProvider";
import ModeSelector from "./ModeSelector";
import { commonBackgrounds } from "@/lib/backgrounds";
import type { InteractionMode } from "@/types/common";
import TypingMode from "./flashcard/TypingMode";
import MultipleChoiceMode from "./flashcard/MultipleChoiceMode";
import FlashcardFeedback from "./flashcard/FlashcardFeedback";

export default function Flashcard() {
  const {
    currentKana,
    loadingKana,
    submitAnswer,
    result,
    nextCard,
    interactionMode,
    setInteractionMode,
    isSubmitting,
  } = useFlashcard();

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

  const handleModeChange = (mode: InteractionMode) => {
    if (isSubmitting || result) return;
    setInteractionMode(mode);
  };

  const handleSubmit = async (answer: string) => {
    if (isSubmitting) return;
    await submitAnswer(answer);
  };

  const handleNextCard = () => {
    nextCard();
  };

  if (loadingKana) {
    return (
      <div className="flex h-32 sm:h-64 items-center justify-center">
        <output
          className="h-8 w-8 sm:h-12 sm:w-12 animate-spin rounded-full border-2 sm:border-4 border-[#d1622b] border-t-transparent"
          aria-label="Loading flashcards"
        ></output>
      </div>
    );
  }

  if (!currentKana) {
    return (
      <div className="text-center p-4">
        <p className="text-base sm:text-lg text-[#705a39]">
          No flashcards available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
      {/* Mode Selector */}
      <ModeSelector
        currentMode={interactionMode}
        onModeChange={handleModeChange}
        disabled={isSubmitting || !!result}
      />

      <div
        className={`mb-6 sm:mb-8 rounded-lg ${commonBackgrounds.flashcard} aspect-[5/3] sm:aspect-[2.5/3.5] flex flex-col justify-between p-4 sm:p-6`}
      >
        <div className="flex-grow flex items-center justify-center">
          <h2
            data-testid="current-kana"
            className="text-6xl xs:text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] leading-none font-bold text-[#403933] drop-shadow-sm"
          >
            {currentKana.character}
          </h2>
        </div>

        {result ? (
          <FlashcardFeedback onNextCard={handleNextCard} isSubmitting={isSubmitting} />
        ) : (
          <div className="mt-auto">
            {interactionMode === "typing" ? (
              <TypingMode 
                currentKana={currentKana} 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} 
              />
            ) : (
              <MultipleChoiceMode 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

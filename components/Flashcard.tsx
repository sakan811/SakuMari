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

import { useState, useEffect, useRef } from "react";
import { useFlashcard } from "./FlashcardProvider";
import ModeSelector from "./ModeSelector";
import MultipleChoice from "./MultipleChoice";
import { LoadingContainer } from "./ui/LoadingSpinner";
import { InteractionMode } from "@/types/kana";
import { colors, createButtonClass, utils } from "@/lib/design-system";

export default function Flashcard() {
  const {
    currentKana,
    loadingKana,
    submitAnswer,
    result,
    nextCard,
    interactionMode,
    setInteractionMode,
    choices,
    isSubmitting,
  } = useFlashcard();

  // Typing mode state
  const [answer, setAnswer] = useState("");

  // Multiple choice mode state
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const [error, setError] = useState("");
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
        nextCard();
        setAnswer("");
        setSelectedChoice(null);
        setError("");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [result, nextCard, isSubmitting]);

  // Clear state when switching modes
  useEffect(() => {
    setAnswer("");
    setSelectedChoice(null);
    setError("");
  }, [interactionMode]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleNextCard = () => {
    nextCard();
    setAnswer("");
    setSelectedChoice(null);
    setError("");
  };

  const handleModeChange = (mode: InteractionMode) => {
    if (isSubmitting || result) return;
    setInteractionMode(mode);
    // State will be cleared by useEffect
  };

  const handleChoiceSelect = (index: number) => {
    if (isSubmitting || result) return;
    setSelectedChoice(index);
    setError("");
  };

  if (loadingKana) {
    return <LoadingContainer />;
  }

  if (!currentKana) {
    return (
      <div className="text-center p-4">
        <p className={`text-base sm:text-lg text-[${colors.secondary}]`}>
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
        className={`mb-6 sm:mb-8 rounded-lg bg-gradient-to-br from-[${colors.accent}] via-[${colors.accent}] to-[${colors.accentLight}] shadow-xl border-2 border-[${colors.secondary}] aspect-[5/3] sm:aspect-[2.5/3.5] flex flex-col justify-between p-4 sm:p-6`}
      >
        <div className="flex-grow flex items-center justify-center">
          <h2
            data-testid="current-kana"
            className={`text-6xl xs:text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] leading-none font-bold text-[${colors.secondaryDark}] drop-shadow-sm`}
          >
            {currentKana.character}
          </h2>
        </div>

        {result && (
          <div
            className={`mb-3 sm:mb-4 rounded-md p-2 sm:p-3 text-center border-2 ${
              result === "correct"
                ? "bg-green-50 text-green-800 border-green-300"
                : `bg-[${colors.primaryDark}] text-white border-red-700`
            }`}
          >
            <p className="text-sm sm:text-lg font-semibold">
              {result === "correct" ? "Correct!" : "Incorrect!"}
            </p>
            <p className="text-xs sm:text-base">
              The correct answer is: <strong>{currentKana.romaji}</strong>
            </p>
          </div>
        )}

        {!result ? (
          <div className="mt-auto flex flex-col space-y-2 sm:space-y-0">
            {interactionMode === "typing" ? (
              /* Typing Mode - Existing functionality */
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (error && e.target.value.trim()) {
                      setError("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  placeholder="Type romaji equivalent..."
                  className={`mb-1 sm:mb-2 rounded-md border-2 ${
                    error
                      ? `border-[${colors.primaryDark}]`
                      : `border-[${colors.secondary}]`
                  } px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-[${colors.primary}] focus:outline-none bg-white text-[${colors.secondaryDark}] placeholder-[${colors.secondary}]`}
                  disabled={isSubmitting}
                  autoFocus
                />
                {error && (
                  <div
                    className={`mb-1 sm:mb-2 text-[${colors.primaryDark}] text-xs sm:text-sm font-medium`}
                  >
                    {error}
                  </div>
                )}
              </>
            ) : (
              /* Multiple Choice Mode - New functionality */
              <div className="mb-4">
                <MultipleChoice
                  choices={choices}
                  selectedChoice={selectedChoice}
                  onChoiceSelect={handleChoiceSelect}
                  disabled={isSubmitting}
                  error={error}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={utils.cn(
                createButtonClass("primary", "md"),
                isSubmitting &&
                  `bg-[${colors.secondary}] cursor-not-allowed border-[${colors.secondary}] hover:bg-[${colors.secondary}] hover:border-[${colors.secondary}] hover:scale-100 hover:shadow-lg`,
              )}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleNextCard}
            disabled={isSubmitting}
            className={utils.cn(
              createButtonClass("primary", "md"),
              isSubmitting &&
                `bg-[${colors.secondary}] cursor-not-allowed border-[${colors.secondary}] hover:bg-[${colors.secondary}] hover:border-[${colors.secondary}] hover:scale-100 hover:shadow-lg`,
            )}
          >
            {isSubmitting ? "Loading..." : "Next Card"}
          </button>
        )}
      </div>
    </div>
  );
}

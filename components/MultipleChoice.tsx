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

import React from "react";

interface MultipleChoiceProps {
  choices: string[];
  selectedChoice: number | null;
  onChoiceSelect: (_index: number) => void;
  disabled?: boolean;
  error?: string;
}

export default function MultipleChoice({
  choices,
  selectedChoice,
  onChoiceSelect,
  disabled = false,
  error,
}: MultipleChoiceProps) {
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChoiceSelect(index);
    }
  };

  if (!choices.length) {
    return (
      <div className="text-center text-[#705a39] py-4">Loading choices...</div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
      {choices.map((choice, index) => (
        <button
          data-testid={`choice-button-${index}`}
          key={`choice-${index}-${choice}`}
          onClick={() => onChoiceSelect(index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={disabled}
          className={`w-full py-4 sm:py-5 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 border-2 min-h-[56px] sm:min-h-[64px] focus:outline-none focus:ring-2 focus:ring-[#d1622b] focus:ring-opacity-50 ${
            selectedChoice === index
              ? "border-[#d1622b] bg-[#fad182]/40 text-[#403933] shadow-md"
              : "border-[#705a39] bg-white text-[#403933] hover:border-[#d1622b] hover:bg-[#fad182]/20 hover:shadow-sm"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          aria-label={`Choice ${index + 1}: ${choice}`}
          tabIndex={disabled ? -1 : 0}
        >
          <span className="font-semibold">{choice}</span>
          {selectedChoice === index && (
            <span className="ml-2 text-[#d1622b]" aria-label="Selected">
              ✓
            </span>
          )}
        </button>
      ))}

      {error && (
        <div
          className="text-[#ae0d13] text-xs sm:text-sm font-medium mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="text-xs text-[#705a39] text-center mt-3 sm:mt-4 opacity-75">
        Tap to select your answer
      </div>
    </div>
  );
}

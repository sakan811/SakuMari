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

import React, { useState, useRef, useEffect } from "react";
import { useFlashcard } from "../FlashcardProvider";
import type { KanaWithAccuracy } from "@/types/common";

interface TypingModeProps {
  currentKana: KanaWithAccuracy;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
}

export default function TypingMode({
  currentKana,
  onSubmit,
  isSubmitting,
}: TypingModeProps) {
  const { result } = useFlashcard();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

 // Focus input when component mounts, when card changes, or after result is cleared
  useEffect(() => {
    if (inputRef.current && !result && !isSubmitting) {
      inputRef.current.focus();
    }
  }, [currentKana, result, isSubmitting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate the answer isn't empty
    if (!answer.trim()) {
      setError("Please enter an answer");
      return;
    }

    setError(""); // Clear any previous errors
    onSubmit(answer.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
    if (error && e.target.value.trim()) {
      setError("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type romaji equivalent..."
          className={`mb-1 sm:mb-2 rounded-md border-2 ${
            error ? "border-[#ae0d13]" : "border-[#705a39]"
          } px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-[#d1622b] focus:outline-none bg-white text-[#403933] placeholder-[#705a39]`}
          disabled={isSubmitting}
          autoFocus
        />
        {error && (
          <div className="mb-1 sm:mb-2 text-[#ae0d13] text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-md px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-white transition-all duration-200 border-2 ${
            isSubmitting
              ? "bg-[#705a39] cursor-not-allowed border-[#705a39]"
              : "bg-[#d1622b] hover:bg-[#ae0d13] border-[#d1622b] hover:border-[#ae0d13] shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </>
  );
}
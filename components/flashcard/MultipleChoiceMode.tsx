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

import React, { useState } from "react";
import MultipleChoice from "../MultipleChoice";
import { useFlashcard } from "../FlashcardProvider";

interface MultipleChoiceModeProps {
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
}

export default function MultipleChoiceMode({
  onSubmit,
  isSubmitting,
}: MultipleChoiceModeProps) {
  const { choices } = useFlashcard();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleChoiceSelect = (index: number) => {
    if (isSubmitting) return;
    setSelectedChoice(index);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Multiple choice validation
    if (selectedChoice === null) {
      setError("Please select an answer");
      return;
    }

    setError(""); // Clear any previous errors
    onSubmit(choices[selectedChoice]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MultipleChoice
        choices={choices}
        selectedChoice={selectedChoice}
        onChoiceSelect={handleChoiceSelect}
        disabled={isSubmitting}
        error={error}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full mt-6 sm:mt-8 rounded-md px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-white transition-all duration-200 border-2 ${
          isSubmitting
            ? "bg-[#705a39] cursor-not-allowed border-[#705a39]"
            : "bg-[#d1622b] hover:bg-[#ae0d13] border-[#d1622b] hover:border-[#ae0d13] shadow-lg hover:shadow-xl transform hover:scale-105"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
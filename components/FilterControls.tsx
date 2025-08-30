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

interface FilterControlsProps {
  filter: "all" | "hiragana" | "katakana";
  setFilter: (filter: "all" | "hiragana" | "katakana") => void;
}

export function FilterControls({ filter, setFilter }: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2">
      <button
        data-testid="filter-all"
        onClick={() => setFilter("all")}
        className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
          filter === "all"
            ? "bg-[#d1622b] text-white border-[#d1622b] shadow-lg"
            : "bg-white text-[#705a39] border-[#705a39] hover:bg-[#fad182] hover:border-[#d1622b]"
        }`}
      >
        All
      </button>
      <button
        data-testid="filter-hiragana"
        onClick={() => setFilter("hiragana")}
        className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
          filter === "hiragana"
            ? "bg-[#d1622b] text-white border-[#d1622b] shadow-lg"
            : "bg-white text-[#705a39] border-[#705a39] hover:bg-[#fad182] hover:border-[#d1622b]"
        }`}
      >
        Hiragana
      </button>
      <button
        data-testid="filter-katakana"
        onClick={() => setFilter("katakana")}
        className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
          filter === "katakana"
            ? "bg-[#d1622b] text-white border-[#d1622b] shadow-lg"
            : "bg-white text-[#705a39] border-[#705a39] hover:bg-[#fad182] hover:border-[#d1622b]"
        }`}
      >
        Katakana
      </button>
    </div>
  );
}

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

type FilterType = "all" | "hiragana" | "katakana";

interface FilterButtonProps {
  value: FilterType;
  currentFilter: FilterType;
  onClick: (filter: FilterType) => void;
  children: React.ReactNode;
}

export function FilterButton({
  value,
  currentFilter,
  onClick,
  children,
}: FilterButtonProps) {
  const isActive = currentFilter === value;

  return (
    <button
      data-testid={`filter-${value}`}
      onClick={() => onClick(value)}
      className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
        isActive
          ? "bg-[#d1622b] text-white border-[#d1622b] shadow-lg"
          : "bg-white text-[#705a39] border-[#705a39] hover:bg-[#fad182] hover:border-[#d1622b]"
      }`}
    >
      {children}
    </button>
  );
}

interface FilterButtonGroupProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  className?: string;
}

export function FilterButtonGroup({
  filter,
  setFilter,
  className = "flex flex-wrap gap-1 sm:gap-2",
}: FilterButtonGroupProps) {
  return (
    <div className={className}>
      <FilterButton value="all" currentFilter={filter} onClick={setFilter}>
        All
      </FilterButton>
      <FilterButton value="hiragana" currentFilter={filter} onClick={setFilter}>
        Hiragana
      </FilterButton>
      <FilterButton value="katakana" currentFilter={filter} onClick={setFilter}>
        Katakana
      </FilterButton>
    </div>
  );
}

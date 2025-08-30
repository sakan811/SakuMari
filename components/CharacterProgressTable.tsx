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
import { SortableTableHeader } from "./SortableTableHeader";
import { CharacterTableRow } from "./CharacterTableRow";
import { ButtonLink } from "./ui/ButtonLink";

type KanaStats = {
  id: string;
  character: string;
  romaji: string;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
};

interface CharacterProgressTableProps {
  filteredStats: KanaStats[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  filter: "all" | "hiragana" | "katakana";
  setFilter: (filter: "all" | "hiragana" | "katakana") => void;
  _onPracticeHiragana: () => void;
  _onPracticeKatakana: () => void;
}

export function CharacterProgressTable({
  filteredStats,
  sortColumn,
  sortDirection,
  onSort,
  filter,
  setFilter,
  _onPracticeHiragana,
  _onPracticeKatakana,
}: CharacterProgressTableProps) {
  return (
    <div className="rounded-lg bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-xl border-2 border-[#705a39] mx-4">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold text-[#403933]">
          Character Progress
        </h2>
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
      </div>

      {filteredStats.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-[#705a39] text-base sm:text-lg mb-3 sm:mb-4">
            No character data available yet.
          </p>
          <p className="text-[#705a39] mb-4 sm:mb-6 text-sm sm:text-base">
            Start practicing to see your progress here!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <ButtonLink
              href="/hiragana"
              size="responsive"
              variant="primary"
              animation="shadow"
            >
              Practice Hiragana
            </ButtonLink>
            <ButtonLink
              href="/katakana"
              size="responsive"
              variant="brown"
              animation="shadow"
            >
              Practice Katakana
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full table-auto min-w-[400px]">
              <thead>
                <tr className="border-b-2 border-[#705a39] text-left">
                  <SortableTableHeader
                    column="character"
                    label="Character"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    testId="sort-character"
                  />
                  <SortableTableHeader
                    column="romaji"
                    label="Romaji"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    testId="sort-romaji"
                  />
                  <SortableTableHeader
                    column="attempts"
                    label="Attempts"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    testId="sort-attempts"
                  />
                  <SortableTableHeader
                    column="correct_attempts"
                    label="Correct Attempts"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    testId="sort-correct-attempts"
                  />
                  <SortableTableHeader
                    column="accuracy"
                    label="Accuracy"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    testId="sort-accuracy"
                  />
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((kana, index) => (
                  <CharacterTableRow key={kana.id} kana={kana} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

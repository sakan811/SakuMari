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

import { useState } from "react";
import TipsModal from "./TipsModal";
import { ButtonLink } from "./ui/ButtonLink";
import { commonBackgrounds } from "@/lib/backgrounds";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSorting } from "@/hooks/useSorting";
import { StatsSummary } from "./StatsSummary";
import { CharacterProgressTable } from "./CharacterProgressTable";
import type { KanaWithAccuracy } from "@/types/common";

export default function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardData();
  const [filter, setFilter] = useState<"all" | "hiragana" | "katakana">("all");
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  const { sortColumn, sortDirection, handleSort, sortedData } =
    useSorting<KanaWithAccuracy>("accuracy", "asc");

  // Filter stats based on selected filter
  const filteredStats = stats.filter((kana) => {
    if (filter === "all") return true;

    const charCode = kana.character.charCodeAt(0);
    const isHiragana = charCode >= 0x3040 && charCode <= 0x309f;
    const isKatakana = charCode >= 0x30a0 && charCode <= 0x30ff;

    if (filter === "hiragana") {
      return isHiragana;
    } else if (filter === "katakana") {
      return isKatakana;
    }
    return false;
  });

  // Sort the filtered stats
  const sortedFilteredStats = sortedData(filteredStats);

  if (loading) {
    return (
      <div className={commonBackgrounds.dashboard}>
        <div
          className="flex h-32 sm:h-64 items-center justify-center"
          role="status"
        >
          <div className="h-8 w-8 sm:h-12 sm:w-12 animate-spin rounded-full border-2 sm:border-4 border-[#d1622b] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={commonBackgrounds.dashboard}>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 pt-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#403933] drop-shadow-sm">
          Dashboard
        </h1>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setIsTipsModalOpen(true)}
            className="rounded-lg bg-gradient-to-br from-[#d1622b]/80 to-[#ae0d13]/80 hover:from-[#d1622b] hover:to-[#ae0d13] px-4 sm:px-6 py-2 sm:py-3 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/20 hover:border-white/40 font-medium text-center text-sm sm:text-base backdrop-blur-sm"
          >
            💡 Tips
          </button>
          <ButtonLink href="/" size="responsive" animation="scale">
            Back to Home
          </ButtonLink>
        </div>
      </div>

      {error ? (
        <div className="mb-4 sm:mb-6 rounded-lg bg-red-100 border-2 border-red-300 p-4 sm:p-6 mx-4">
          <p className="text-red-800 text-center font-medium text-sm sm:text-base">
            {error}
          </p>
          <div className="text-center mt-3 sm:mt-4">
            <button
              onClick={refetch}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <StatsSummary stats={filteredStats} />

          {/* Character Progress Table */}
          <CharacterProgressTable
            filteredStats={sortedFilteredStats}
            sortColumn={sortColumn as string}
            sortDirection={sortDirection}
            onSort={handleSort}
            filter={filter}
            setFilter={setFilter}
          />
        </>
      )}

      {/* Tips Modal */}
      <TipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />
    </div>
  );
}

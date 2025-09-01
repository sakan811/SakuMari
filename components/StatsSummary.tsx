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
import { backgrounds } from "@/lib/backgrounds";
import type { KanaWithAccuracy } from "@/types/common";


interface StatsSummaryProps {
  stats: KanaWithAccuracy[];
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  const filteredStats = stats;
  const practicedStats = filteredStats.filter((kana) => kana.attempts > 0);

  const averageAccuracy =
    practicedStats.length > 0
      ? practicedStats.reduce((sum, kana) => sum + kana.accuracy, 0) /
        practicedStats.length
      : 0;

  const totalAttempts = filteredStats.reduce(
    (sum, kana) => sum + kana.attempts,
    0,
  );

  return (
    <div className="mb-4 sm:mb-6 rounded-lg bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-xl border-2 border-[#705a39] mx-4">
      <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#403933]">
        Your Progress
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <div
          className={`rounded-md ${backgrounds.progress.struggling} p-3 sm:p-4 text-center shadow-lg border-2 border-[#403933]`}
        >
          <p className="text-xs sm:text-sm text-[#fad182] font-medium">
            Total Characters Practiced
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {practicedStats.length}
          </p>
        </div>
        <div
          className={`rounded-md ${backgrounds.progress.good} p-3 sm:p-4 text-center shadow-lg border-2 border-green-700`}
        >
          <p className="text-xs sm:text-sm text-green-100 font-medium">
            Average Accuracy
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {practicedStats.length > 0 ? (averageAccuracy * 100).toFixed(1) : 0}
            %
          </p>
        </div>
        <div
          className={`rounded-md ${backgrounds.progress.excellent} p-3 sm:p-4 text-center shadow-lg border-2 border-[#ae0d13]`}
        >
          <p className="text-xs sm:text-sm text-orange-100 font-medium">
            Total Attempts
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {totalAttempts}
          </p>
        </div>
      </div>
    </div>
  );
}

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
import type { KanaWithAccuracy } from "@/types/common";

interface CharacterTableRowProps {
  kana: KanaWithAccuracy;
  index: number;
}

export function CharacterTableRow({ kana, index }: CharacterTableRowProps) {
  return (
    <tr
      key={kana.id}
      className={`border-b border-[#705a39]/30 ${index % 2 === 0 ? "bg-white/50" : "bg-[#fad182]/20"} hover:bg-[#fad182]/40 transition-colors duration-200`}
    >
      <td className="py-2 sm:py-3 text-lg sm:text-2xl text-[#403933] px-1 sm:px-0">
        {kana.character}
      </td>
      <td className="py-2 sm:py-3 text-[#705a39] font-medium text-xs sm:text-base px-1 sm:px-0">
        {kana.romaji}
      </td>
      <td className="py-2 sm:py-3 text-[#403933] font-medium text-xs sm:text-base px-1 sm:px-0">
        {kana.attempts}
      </td>
      <td className="py-2 sm:py-3 text-[#403933] font-medium text-xs sm:text-base px-1 sm:px-0">
        {kana.correct_attempts}
      </td>
      <td className="py-2 sm:py-3 px-1 sm:px-0">
        <div className="flex items-center">
          <div className="mr-2 sm:mr-3 h-2 sm:h-3 w-16 sm:w-24 rounded-full bg-[#705a39]/30 border border-[#705a39]/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d1622b] to-[#ae0d13] transition-all duration-300"
              style={{ width: `${kana.accuracy * 100}%` }}
            ></div>
          </div>
          <span className="text-xs sm:text-sm font-medium text-[#403933]">
            {(kana.accuracy * 100).toFixed(0)}%
          </span>
        </div>
      </td>
    </tr>
  );
}

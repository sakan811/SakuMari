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

import type { KanaWithAccuracy } from "@/types/common";

export type KanaFilter = "all" | "hiragana" | "katakana";

/**
 * Filters kana characters based on the specified filter type
 * @param kana - The kana character with accuracy data to filter
 * @param filter - The filter type to apply
 * @returns boolean indicating whether the kana should be included in the filtered results
 */
export function filterKanaByType(kana: KanaWithAccuracy, filter: KanaFilter): boolean {
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
}
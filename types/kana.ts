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

export type KanaData = {
  id: string;
  character: string;
  romaji: string;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
};

export type SortColumn = 
  | "character"
  | "romaji"
  | "attempts"
  | "correct_attempts"
  | "accuracy";

export type KanaFilter = "all" | "hiragana" | "katakana";
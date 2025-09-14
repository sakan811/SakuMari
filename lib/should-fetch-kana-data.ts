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

/**
 * Determines if kana data should be fetched based on fetch history and kana type
 * @param hasFetched - Whether data has been fetched before
 * @param kanaType - Optional kana type filter
 * @returns boolean indicating if data should be fetched
 */
export function shouldFetchKanaData(hasFetched: boolean, kanaType?: "hiragana" | "katakana"): boolean {
  return !hasFetched || !!kanaType;
}
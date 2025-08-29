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
import FlashcardApp from "@/components/FlashcardApp";
import { createPresetMetadata } from "@/lib/metadata";

export type KanaType = "hiragana" | "katakana";

/**
 * Creates a practice page component for kana learning
 * @param kanaType - The type of kana practice (hiragana or katakana)
 * @returns React component for the practice page
 */
export function createPracticePage(kanaType: KanaType) {
  const PageComponent = function PracticePage() {
    return <FlashcardApp kanaType={kanaType} />;
  };

  PageComponent.displayName = `${kanaType.charAt(0).toUpperCase() + kanaType.slice(1)}PracticePage`;

  return PageComponent;
}

/**
 * Gets metadata for a practice page
 * @param kanaType - The type of kana practice
 * @returns Metadata object for the page
 */
export function getPracticePageMetadata(kanaType: KanaType) {
  return createPresetMetadata(kanaType);
}

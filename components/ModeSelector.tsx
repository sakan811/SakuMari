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

import { InteractionMode } from "@/types/kana";

interface ModeSelectorProps {
  currentMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({
  currentMode,
  onModeChange,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <div className="mb-4 flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-lg border border-[#705a39]/20 shadow-sm">
      <button
        data-testid="typing-button"
        onClick={() => onModeChange("typing")}
        disabled={disabled}
        className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
          currentMode === "typing"
            ? "bg-[#d1622b] text-white shadow-sm border border-[#ae0d13]"
            : "text-[#705a39] hover:text-[#403933] hover:bg-white/40 border border-transparent"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="inline-block mr-1">⌨️</span>
        <span className="hidden xs:inline">Typing</span>
        <span className="xs:hidden">Type</span>
      </button>
      <button
        data-testid="multiple-choice-button"
        onClick={() => onModeChange("multiple-choice")}
        disabled={disabled}
        className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
          currentMode === "multiple-choice"
            ? "bg-[#d1622b] text-white shadow-sm border border-[#ae0d13]"
            : "text-[#705a39] hover:text-[#403933] hover:bg-white/40 border border-transparent"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="inline-block mr-1">📝</span>
        <span className="hidden xs:inline">Choices</span>
        <span className="xs:hidden">Pick</span>
      </button>
    </div>
  );
}

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

interface TipsButtonProps {
  onOpenTips: () => void;
}

export default function TipsButton({ onOpenTips }: TipsButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[#403933] text-white text-sm rounded-lg shadow-lg whitespace-nowrap border border-[#705a39]">
          Get learning tips
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#403933]"></div>
        </div>
      )}
      
      {/* Tips Button */}
      <button
        onClick={onOpenTips}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="
          w-14 h-14 sm:w-16 sm:h-16
          bg-gradient-to-br from-[#d1622b]/80 to-[#ae0d13]/80 
          hover:from-[#d1622b] hover:to-[#ae0d13]
          backdrop-blur-sm
          text-white 
          rounded-full 
          shadow-lg hover:shadow-xl 
          transform hover:scale-110 
          transition-all duration-300 
          border-2 border-white/20 hover:border-white/40
          flex items-center justify-center
          text-xl sm:text-2xl
          font-bold
          hover:rotate-12
          active:scale-95
        "
        aria-label="Get Japanese kana learning tips"
      >
        💡
      </button>
    </div>
  );
}
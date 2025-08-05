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

import Link from "next/link";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useState } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"flashcards" | "dashboard">(
    "flashcards",
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fad182] via-[#f5c55a] to-[#fad182]">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex h-32 sm:h-64 items-center justify-center">
          <div className="h-8 w-8 sm:h-12 sm:w-12 animate-spin rounded-full border-2 sm:border-4 border-[#d1622b] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fad182] via-[#f5c55a] to-[#fad182]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[#403933] drop-shadow-lg leading-tight">
            🌸 SakuMari 🌸
          </h1>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 text-[#403933]">
            Japanese Kana Flashcard App
          </h2>
          <p className="text-sm sm:text-lg lg:text-xl text-[#705a39] font-medium">
            Master Hiragana and Katakana with interactive practice
          </p>
        </div>

        {session ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              <Link
                href="/hiragana"
                className="group block p-4 sm:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 sm:border-3 border-[#705a39] hover:border-[#d1622b] transform hover:scale-105"
              >
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-[#403933] group-hover:text-[#d1622b] transition-colors duration-300">
                    ひらがな Hiragana Practice
                  </h2>
                  <p className="text-3xl sm:text-4xl lg:text-6xl mb-4 sm:mb-6 text-[#705a39] group-hover:text-[#d1622b] transition-colors duration-300">
                    あいう
                  </p>
                  <p className="text-sm sm:text-base text-[#705a39] font-medium group-hover:text-[#403933] transition-colors duration-300 mb-3 sm:mb-4">
                    Practice the Hiragana characters
                  </p>
                  <div className="inline-block px-3 sm:px-4 py-2 bg-[#d1622b] text-white rounded-lg group-hover:bg-[#ae0d13] transition-colors duration-300 font-medium text-sm sm:text-base">
                    Start Learning →
                  </div>
                </div>
              </Link>

              <Link
                href="/katakana"
                className="group block p-4 sm:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 sm:border-3 border-[#705a39] hover:border-[#d1622b] transform hover:scale-105"
              >
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-[#403933] group-hover:text-[#d1622b] transition-colors duration-300">
                    カタカナ Katakana Practice
                  </h2>
                  <p className="text-3xl sm:text-4xl lg:text-6xl mb-4 sm:mb-6 text-[#705a39] group-hover:text-[#d1622b] transition-colors duration-300">
                    アイウ
                  </p>
                  <p className="text-sm sm:text-base text-[#705a39] font-medium group-hover:text-[#403933] transition-colors duration-300 mb-3 sm:mb-4">
                    Practice the Katakana characters
                  </p>
                  <div className="inline-block px-3 sm:px-4 py-2 bg-[#d1622b] text-white rounded-lg group-hover:bg-[#ae0d13] transition-colors duration-300 font-medium text-sm sm:text-base">
                    Start Learning →
                  </div>
                </div>
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/dashboard"
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#d1622b] to-[#ae0d13] text-white rounded-xl hover:from-[#ae0d13] hover:to-[#950a1e] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-[#d1622b] hover:border-[#ae0d13] font-bold text-base sm:text-lg"
              >
                📊 View Your Progress
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 sm:p-8 border-2 border-[#705a39] max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-[#403933]">
                Welcome to SakuMari!
              </h2>
              <p className="text-sm sm:text-base text-[#705a39] mb-4 sm:mb-6 leading-relaxed">
                Sign in with your Google account to start practicing Japanese
                Kana characters. Your progress will be saved and you can track
                your improvement over time.
              </p>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-[#705a39] mb-3 sm:mb-4">
                  Click &quot;Sign In with Google&quot; in the top navigation to
                  get started.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
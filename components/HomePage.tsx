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
import { LoadingContainer } from "./ui/LoadingSpinner";
import {
  gradients,
  colors,
  createButtonClass,
  utils,
} from "@/lib/design-system";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={`min-h-screen ${gradients.main}`}>
        <Header />
        <LoadingContainer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${gradients.main}`}>
      <Header />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1
            className={utils.cn(
              "text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4 drop-shadow-lg leading-tight",
              `text-[${colors.secondaryDark}]`,
            )}
          >
            🌸 SakuMari 🌸
          </h1>
          <h2
            className={utils.cn(
              "text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3",
              `text-[${colors.secondaryDark}]`,
            )}
          >
            Japanese Kana Flashcard App
          </h2>
          <p
            className={utils.cn(
              "text-sm sm:text-lg lg:text-xl font-medium",
              `text-[${colors.secondary}]`,
            )}
          >
            Master Hiragana and Katakana with interactive practice
          </p>
        </div>

        {session ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              <Link
                href="/hiragana"
                className={utils.cn(
                  "group block p-4 sm:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 sm:border-3 transform hover:scale-105",
                  `border-[${colors.secondary}] hover:border-[${colors.primary}]`,
                )}
              >
                <div className="text-center">
                  <h2
                    className={utils.cn(
                      "text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 transition-colors duration-300",
                      `text-[${colors.secondaryDark}] group-hover:text-[${colors.primary}]`,
                    )}
                  >
                    ひらがな Hiragana Practice
                  </h2>
                  <p
                    className={utils.cn(
                      "text-3xl sm:text-4xl lg:text-6xl mb-4 sm:mb-6 transition-colors duration-300",
                      `text-[${colors.secondary}] group-hover:text-[${colors.primary}]`,
                    )}
                  >
                    あいう
                  </p>
                  <p
                    className={utils.cn(
                      "text-sm sm:text-base font-medium transition-colors duration-300 mb-3 sm:mb-4",
                      `text-[${colors.secondary}] group-hover:text-[${colors.secondaryDark}]`,
                    )}
                  >
                    Practice the Hiragana characters
                  </p>
                  <div
                    className={utils.cn(
                      createButtonClass("primary", "sm"),
                      "inline-block group-hover:bg-[#ae0d13] transition-colors duration-300 text-sm sm:text-base",
                    )}
                  >
                    Start Learning →
                  </div>
                </div>
              </Link>

              <Link
                href="/katakana"
                className={utils.cn(
                  "group block p-4 sm:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 sm:border-3 transform hover:scale-105",
                  `border-[${colors.secondary}] hover:border-[${colors.primary}]`,
                )}
              >
                <div className="text-center">
                  <h2
                    className={utils.cn(
                      "text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 transition-colors duration-300",
                      `text-[${colors.secondaryDark}] group-hover:text-[${colors.primary}]`,
                    )}
                  >
                    カタカナ Katakana Practice
                  </h2>
                  <p
                    className={utils.cn(
                      "text-3xl sm:text-4xl lg:text-6xl mb-4 sm:mb-6 transition-colors duration-300",
                      `text-[${colors.secondary}] group-hover:text-[${colors.primary}]`,
                    )}
                  >
                    アイウ
                  </p>
                  <p
                    className={utils.cn(
                      "text-sm sm:text-base font-medium transition-colors duration-300 mb-3 sm:mb-4",
                      `text-[${colors.secondary}] group-hover:text-[${colors.secondaryDark}]`,
                    )}
                  >
                    Practice the Katakana characters
                  </p>
                  <div
                    className={utils.cn(
                      createButtonClass("primary", "sm"),
                      "inline-block group-hover:bg-[#ae0d13] transition-colors duration-300 text-sm sm:text-base",
                    )}
                  >
                    Start Learning →
                  </div>
                </div>
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/dashboard"
                className={utils.cn(
                  createButtonClass("primaryGradient", "lg"),
                  "inline-block rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-base sm:text-lg",
                )}
              >
                📊 View Your Progress
              </Link>
              <p
                className={utils.cn(
                  "text-xs sm:text-sm mt-3 sm:mt-4 font-medium",
                  `text-[${colors.secondary}]`,
                )}
              >
                ✨ Get AI-powered learning tips in your Dashboard to improve
                faster
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div
              className={utils.cn(
                "bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 sm:p-8 border-2 max-w-2xl mx-auto",
                `border-[${colors.secondary}]`,
              )}
            >
              <h2
                className={utils.cn(
                  "text-xl sm:text-2xl font-bold mb-3 sm:mb-4",
                  `text-[${colors.secondaryDark}]`,
                )}
              >
                Welcome to SakuMari!
              </h2>
              <p
                className={utils.cn(
                  "text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed",
                  `text-[${colors.secondary}]`,
                )}
              >
                Sign in with your Google account to start practicing Japanese
                Kana characters. Your progress will be saved and you can track
                your improvement over time with AI-powered learning tips.
              </p>
              <div className="text-center">
                <p
                  className={utils.cn(
                    "text-xs sm:text-sm mb-3 sm:mb-4",
                    `text-[${colors.secondary}]`,
                  )}
                >
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

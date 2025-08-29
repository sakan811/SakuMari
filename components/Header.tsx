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
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  createButtonClass,
  colors,
  gradients,
  utils,
} from "@/lib/design-system";
export default function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [credentialsEnabled, setCredentialsEnabled] = useState(false);

  useEffect(() => {
    // Fetch credentials provider status
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setCredentialsEnabled(data.credentialsEnabled))
      .catch(() => setCredentialsEnabled(false));
  }, []);

  return (
    <header
      className={utils.cn(
        gradients.secondary,
        "shadow-xl border-b-4",
        `border-[${colors.primary}]`,
      )}
    >
      <div className="container mx-auto p-3 sm:p-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className={utils.cn(
              "text-lg sm:text-2xl font-bold hover:text-white transition-colors duration-200 drop-shadow-sm min-h-[44px] relative z-10 inline-flex items-center",
              `text-[${colors.accent}]`,
            )}
          >
            🌸 SakuMari
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {session ? (
              <>
                <Link
                  href="/hiragana"
                  className={utils.cn(
                    "hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-2 border-transparent text-sm xl:text-base min-h-[44px] relative z-10 inline-flex items-center",
                    `text-[${colors.accent}] hover:border-[${colors.accent}]`,
                  )}
                >
                  <span className="hidden xl:inline">ひらがな </span>Hiragana
                </Link>
                <Link
                  href="/katakana"
                  className={utils.cn(
                    "hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-2 border-transparent text-sm xl:text-base min-h-[44px] relative z-10 inline-flex items-center",
                    `text-[${colors.accent}] hover:border-[${colors.accent}]`,
                  )}
                >
                  <span className="hidden xl:inline">カタカナ </span>Katakana
                </Link>
                <Link
                  href="/dashboard"
                  className={utils.cn(
                    createButtonClass("primary", "md"),
                    "text-sm xl:text-base min-h-[44px] relative z-10 inline-flex items-center",
                  )}
                >
                  📊 Dashboard
                </Link>
                <div className="flex items-center space-x-2 xl:space-x-3">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className={`w-6 h-6 xl:w-8 xl:h-8 rounded-full border-2 border-[${colors.accent}]`}
                      unoptimized
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`w-6 h-6 xl:w-8 xl:h-8 rounded-full border-2 border-[${colors.accent}] bg-[${colors.accent}] flex items-center justify-center`}
                    >
                      <span
                        className={`text-[${colors.secondaryDark}] text-xs xl:text-sm font-bold`}
                      >
                        {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className={utils.cn(
                      "hover:bg-white/10 border-2 border-transparent transition-colors duration-200 font-medium px-4 py-3 rounded-lg text-sm xl:text-base min-h-[44px] min-w-[80px] relative z-10 cursor-pointer",
                      `text-[${colors.accent}] hover:border-[${colors.accent}]`,
                    )}
                    type="button"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : credentialsEnabled ? (
              <button
                onClick={() => signIn("credentials")}
                disabled={status === "loading"}
                className={utils.cn(
                  createButtonClass("primary", "md"),
                  "disabled:opacity-50 disabled:cursor-not-allowed text-sm xl:text-base min-h-[44px] relative z-10 cursor-pointer",
                )}
                type="button"
              >
                {status === "loading" ? "Loading..." : "Sign In"}
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                disabled={status === "loading"}
                className={utils.cn(
                  createButtonClass("primary", "md"),
                  "disabled:opacity-50 disabled:cursor-not-allowed text-sm xl:text-base min-h-[44px] relative z-10 cursor-pointer",
                )}
                type="button"
              >
                {status === "loading" ? "Loading..." : "Sign In"}
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={utils.cn(
              "lg:hidden hover:text-white transition-colors duration-200 p-3 min-h-[44px] min-w-[44px] relative z-10 cursor-pointer",
              `text-[${colors.accent}]`,
            )}
            aria-label="Toggle mobile menu"
            type="button"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav
            className={utils.cn(
              "lg:hidden mt-3 sm:mt-4 pt-3 sm:pt-4 border-t",
              `border-[${colors.accent}]/30`,
            )}
          >
            <div className="flex flex-col space-y-2 sm:space-y-3">
              {session ? (
                <>
                  <Link
                    href="/hiragana"
                    onClick={() => setMobileMenuOpen(false)}
                    className={utils.cn(
                      "hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 border-2 border-transparent text-sm sm:text-base min-h-[44px] relative z-10 inline-flex items-center",
                      `text-[${colors.accent}] hover:border-[${colors.accent}]`,
                    )}
                  >
                    ひらがな Hiragana
                  </Link>
                  <Link
                    href="/katakana"
                    onClick={() => setMobileMenuOpen(false)}
                    className={utils.cn(
                      "hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 border-2 border-transparent text-sm sm:text-base min-h-[44px] relative z-10 inline-flex items-center",
                      `text-[${colors.accent}] hover:border-[${colors.accent}]`,
                    )}
                  >
                    カタカナ Katakana
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={utils.cn(
                      createButtonClass("primary", "md"),
                      "text-sm sm:text-base w-fit min-h-[44px] relative z-10 inline-flex items-center",
                    )}
                  >
                    📊 Dashboard
                  </Link>
                  <div className="flex items-center space-x-3 px-3 py-2">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className={utils.cn(
                          "w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2",
                          `border-[${colors.accent}]`,
                        )}
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={utils.cn(
                          "w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center",
                          `border-[${colors.accent}] bg-[${colors.accent}]`,
                        )}
                      >
                        <span
                          className={utils.cn(
                            "text-xs sm:text-sm font-bold",
                            `text-[${colors.secondaryDark}]`,
                          )}
                        >
                          {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <span
                      className={utils.cn(
                        "text-sm sm:text-base font-medium",
                        `text-[${colors.accent}]`,
                      )}
                    >
                      {session.user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className={utils.cn(
                      "hover:bg-white/10 border-2 border-transparent transition-colors duration-200 font-medium px-4 py-3 rounded-lg text-left text-sm sm:text-base w-fit min-h-[44px] min-w-[80px] relative z-10 cursor-pointer",
                      `text-[${colors.accent}] hover:border-[${colors.accent}]`,
                    )}
                    type="button"
                  >
                    Sign Out
                  </button>
                </>
              ) : credentialsEnabled ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      signIn("google");
                      setMobileMenuOpen(false);
                    }}
                    disabled={status === "loading"}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-[#4285f4] hover:bg-[#3367d6] text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] cursor-pointer"
                    type="button"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {status === "loading" ? "Loading..." : "Sign In"}
                  </button>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex-1 h-px bg-[${colors.accent}]/30`}
                    ></div>
                    <span className={`text-[${colors.accent}] text-sm`}>
                      or
                    </span>
                    <div
                      className={`flex-1 h-px bg-[${colors.accent}]/30`}
                    ></div>
                  </div>
                  <button
                    onClick={() => {
                      signIn("credentials");
                      setMobileMenuOpen(false);
                    }}
                    disabled={status === "loading"}
                    className={utils.cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium border-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] cursor-pointer",
                      `bg-[${colors.secondaryDark}] hover:bg-[${colors.secondary}] text-[${colors.accent}] border-[${colors.primary}]`,
                    )}
                    type="button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Sign In
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signIn("google");
                    setMobileMenuOpen(false);
                  }}
                  disabled={status === "loading"}
                  className={utils.cn(
                    createButtonClass("primary", "md"),
                    "disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-fit min-h-[44px] relative z-10 cursor-pointer",
                  )}
                  type="button"
                >
                  {status === "loading" ? "Loading..." : "Sign In"}
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

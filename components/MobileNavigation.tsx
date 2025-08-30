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
import Link from "next/link";
import Image from "next/image";
import { signOut, signIn } from "next-auth/react";

interface MobileNavigationProps {
  session: any;
  status: any;
  credentialsEnabled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function MobileNavigation({
  session,
  status,
  credentialsEnabled,
  mobileMenuOpen,
  setMobileMenuOpen,
}: MobileNavigationProps) {
  if (!mobileMenuOpen) return null;

  const handleSignIn = (provider: string) => {
    signIn(provider);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setMobileMenuOpen(false);
  };

  if (session) {
    return (
      <nav className="lg:hidden mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#fad182]/30">
        <div className="flex flex-col space-y-2 sm:space-y-3">
          <Link
            href="/hiragana"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 border-2 border-transparent hover:border-[#fad182] text-sm sm:text-base min-h-[44px] relative z-10 inline-flex items-center"
          >
            ひらがな Hiragana
          </Link>
          <Link
            href="/katakana"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 border-2 border-transparent hover:border-[#fad182] text-sm sm:text-base min-h-[44px] relative z-10 inline-flex items-center"
          >
            カタカナ Katakana
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg bg-[#d1622b] hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13] shadow-lg text-sm sm:text-base w-fit min-h-[44px] relative z-10 inline-flex items-center"
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
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#fad182]"
                unoptimized
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#fad182] bg-[#fad182] flex items-center justify-center">
                <span className="text-[#403933] text-xs sm:text-sm font-bold">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <span className="text-[#fad182] text-sm sm:text-base font-medium">
              {session.user?.name}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 border-2 border-transparent hover:border-[#fad182] text-left text-sm sm:text-base w-fit min-h-[44px] min-w-[80px] relative z-10 cursor-pointer"
            type="button"
          >
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  if (credentialsEnabled) {
    return (
      <nav className="lg:hidden mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#fad182]/30">
        <div className="flex flex-col space-y-2 sm:space-y-3">
          <button
            onClick={() => handleSignIn("google")}
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
            {status === "loading" ? "Loading..." : "Sign In with Google"}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#fad182]/30"></div>
            <span className="text-[#fad182] text-sm">or</span>
            <div className="flex-1 h-px bg-[#fad182]/30"></div>
          </div>
          <button
            onClick={() => handleSignIn("credentials")}
            disabled={status === "loading"}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#403933] hover:bg-[#705a39] text-[#fad182] rounded-lg transition-colors duration-200 font-medium border-2 border-[#d1622b] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] cursor-pointer"
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
            {status === "loading" ? "Loading..." : "Sign In with Credentials"}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="lg:hidden mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#fad182]/30">
      <div className="flex flex-col space-y-2 sm:space-y-3">
        <button
          onClick={() => handleSignIn("google")}
          disabled={status === "loading"}
          className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg bg-[#d1622b] hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-fit min-h-[44px] relative z-10 cursor-pointer"
          type="button"
        >
          {status === "loading" ? "Loading..." : "Sign In with Google"}
        </button>
      </div>
    </nav>
  );
}

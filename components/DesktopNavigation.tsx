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

interface DesktopNavigationProps {
  session: any;
  status: any;
  credentialsEnabled: boolean;
}

export function DesktopNavigation({
  session,
  status,
  credentialsEnabled,
}: DesktopNavigationProps) {
  if (session) {
    return (
      <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
        <Link
          href="/hiragana"
          className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-2 border-transparent hover:border-[#fad182] text-sm xl:text-base min-h-[44px] relative z-10 inline-flex items-center"
        >
          <span className="hidden xl:inline">ひらがな </span>Hiragana
        </Link>
        <Link
          href="/katakana"
          className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 border-2 border-transparent hover:border-[#fad182] text-sm xl:text-base min-h-[44px] relative z-10 inline-flex items-center"
        >
          <span className="hidden xl:inline">カタカナ </span>Katakana
        </Link>
        <Link
          href="/dashboard"
          className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg bg-[#d1622b] hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13] shadow-lg hover:shadow-xl text-sm xl:text-base min-h-[44px] relative z-10 inline-flex items-center"
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
              className="w-6 h-6 xl:w-8 xl:h-8 rounded-full border-2 border-[#fad182]"
              unoptimized
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-full border-2 border-[#fad182] bg-[#fad182] flex items-center justify-center">
              <span className="text-[#403933] text-xs xl:text-sm font-bold">
                {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 border-2 border-transparent hover:border-[#fad182] text-sm xl:text-base min-h-[44px] min-w-[80px] relative z-10 cursor-pointer"
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
      <nav className="hidden lg:flex items-center">
        <button
          onClick={() => signIn("credentials")}
          disabled={status === "loading"}
          className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg bg-[#d1622b] hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm xl:text-base min-h-[44px] relative z-10 cursor-pointer"
          type="button"
        >
          {status === "loading" ? "Loading..." : "Sign In"}
        </button>
      </nav>
    );
  }

  return (
    <nav className="hidden lg:flex items-center">
      <button
        onClick={() => signIn("google")}
        disabled={status === "loading"}
        className="text-[#fad182] hover:text-white transition-colors duration-200 font-medium px-4 py-3 rounded-lg bg-[#d1622b] hover:bg-[#ae0d13] border-2 border-[#d1622b] hover:border-[#ae0d13] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm xl:text-base min-h-[44px] relative z-10 cursor-pointer"
        type="button"
      >
        {status === "loading" ? "Loading..." : "Sign In"}
      </button>
    </nav>
  );
}

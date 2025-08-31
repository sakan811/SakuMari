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
import { Button } from "@/components/ui/Button";

interface DesktopNavigationProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
  status: "loading" | "authenticated" | "unauthenticated";
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
        <Button
          variant="ghost"
          size="responsive"
          className="hover:bg-white/10 hover:border-[#fad182] text-[#fad182]"
          asChild
        >
          <Link href="/hiragana">
            <span className="hidden xl:inline">ひらがな </span>Hiragana
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="responsive"
          className="hover:bg-white/10 hover:border-[#fad182] text-[#fad182]"
          asChild
        >
          <Link href="/katakana">
            <span className="hidden xl:inline">カタカナ </span>Katakana
          </Link>
        </Button>
        <Button variant="primary" size="md" asChild>
          <Link href="/dashboard">📊 Dashboard</Link>
        </Button>
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
          <Button
            onClick={() => signOut()}
            variant="ghost"
            size="md"
            className="hover:bg-white/10 hover:border-[#fad182] text-[#fad182] min-w-[80px]"
          >
            Sign Out
          </Button>
        </div>
      </nav>
    );
  }

  if (credentialsEnabled) {
    return (
      <nav className="hidden lg:flex items-center">
        <Button
          onClick={() => signIn("credentials")}
          disabled={status === "loading"}
          variant="primary"
          size="md"
          loading={status === "loading"}
        >
          Sign In
        </Button>
      </nav>
    );
  }

  return (
    <nav className="hidden lg:flex items-center">
      <Button
        onClick={() => signIn("google")}
        disabled={status === "loading"}
        variant="primary"
        size="md"
        loading={status === "loading"}
      >
        Sign In
      </Button>
    </nav>
  );
}

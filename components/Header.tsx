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
import { useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

interface HeaderProps {
  activeTab?: "flashcards" | "dashboard";
  setActiveTab?: (_: "flashcards" | "dashboard") => void;
}

export default function Header(_: HeaderProps) {
  const { session, status, credentialsEnabled } = useAuthStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#403933] via-[#705a39] to-[#403933] shadow-xl border-b-4 border-[#d1622b]">
      <div className="container mx-auto p-3 sm:p-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg sm:text-2xl font-bold text-[#fad182] hover:text-white transition-colors duration-200 drop-shadow-sm min-h-[44px] relative z-10 inline-flex items-center"
          >
            🌸 SakuMari
          </Link>

          {/* Desktop Navigation */}
          <DesktopNavigation
            session={session}
            status={status}
            credentialsEnabled={credentialsEnabled}
          />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#fad182] hover:text-white transition-colors duration-200 p-3 min-h-[44px] min-w-[44px] relative z-10 cursor-pointer"
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
        <MobileNavigation
          session={session}
          status={status}
          credentialsEnabled={credentialsEnabled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>
    </header>
  );
}

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

import { useState, useEffect } from "react";
import Link from "next/link";
import TipsButton from "./TipsButton";
import TipsModal from "./TipsModal";

type KanaStats = {
  id: string;
  character: string;
  romaji: string;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<KanaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "hiragana" | "katakana">("all");
  const [sortColumn, setSortColumn] = useState<
    "character" | "romaji" | "attempts" | "correct_attempts" | "accuracy"
  >("accuracy");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch("/api/stats");
      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to view your progress");
          return;
        }
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      const data = await response.json();
      setStats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load progress data");
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSort = (
    column:
      | "character"
      | "romaji"
      | "attempts"
      | "correct_attempts"
      | "accuracy",
  ) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedStats = [
    ...(filter === "all"
      ? stats
      : stats.filter((kana) => {
          const charCode = kana.character.charCodeAt(0);
          const isHiragana = charCode >= 0x3040 && charCode <= 0x309f;
          const isKatakana = charCode >= 0x30a0 && charCode <= 0x30ff;

          if (filter === "hiragana") {
            return isHiragana;
          } else if (filter === "katakana") {
            return isKatakana;
          }
          return false;
        })),
  ].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortColumn) {
      case "character":
        aValue = a.character;
        bValue = b.character;
        break;
      case "romaji":
        aValue = a.romaji;
        bValue = b.romaji;
        break;
      case "attempts":
        aValue = a.attempts;
        bValue = b.attempts;
        break;
      case "correct_attempts":
        aValue = a.correct_attempts;
        bValue = b.correct_attempts;
        break;
      case "accuracy":
        aValue = a.accuracy;
        bValue = b.accuracy;
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    } else {
      const comparison = (aValue as number) - (bValue as number);
      return sortDirection === "asc" ? comparison : -comparison;
    }
  });

  const filteredStats = sortedStats;
  const practicedStats = filteredStats.filter((kana) => kana.attempts > 0);

  const averageAccuracy =
    practicedStats.length > 0
      ? practicedStats.reduce((sum, kana) => sum + kana.accuracy, 0) /
        practicedStats.length
      : 0;

  const totalAttempts = filteredStats.reduce(
    (sum, kana) => sum + kana.attempts,
    0,
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#fad182] to-[#f5c55a] min-h-screen">
        <div className="flex h-32 sm:h-64 items-center justify-center">
          <div className="h-8 w-8 sm:h-12 sm:w-12 animate-spin rounded-full border-2 sm:border-4 border-[#d1622b] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#fad182] to-[#f5c55a] min-h-screen">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 pt-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#403933] drop-shadow-sm">
          Dashboard
        </h1>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setIsTipsModalOpen(true)}
            className="rounded-lg bg-gradient-to-br from-[#d1622b]/80 to-[#ae0d13]/80 hover:from-[#d1622b] hover:to-[#ae0d13] px-4 sm:px-6 py-2 sm:py-3 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/20 hover:border-white/40 font-medium text-center text-sm sm:text-base backdrop-blur-sm"
          >
            💡 Tips
          </button>
          <Link
            href="/"
            className="rounded-lg bg-[#d1622b] px-4 sm:px-6 py-2 sm:py-3 text-white hover:bg-[#ae0d13] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-[#d1622b] hover:border-[#ae0d13] font-medium text-center text-sm sm:text-base"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-4 sm:mb-6 rounded-lg bg-red-100 border-2 border-red-300 p-4 sm:p-6 mx-4">
          <p className="text-red-800 text-center font-medium text-sm sm:text-base">
            {error}
          </p>
          <div className="text-center mt-3 sm:mt-4">
            <button
              onClick={fetchStats}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-4 sm:mb-6 rounded-lg bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-xl border-2 border-[#705a39] mx-4">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#403933]">
              Your Progress
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              <div className="rounded-md bg-gradient-to-br from-[#705a39] to-[#403933] p-3 sm:p-4 text-center shadow-lg border-2 border-[#403933]">
                <p className="text-xs sm:text-sm text-[#fad182] font-medium">
                  Total Characters Practiced
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {practicedStats.length}
                </p>
              </div>
              <div className="rounded-md bg-gradient-to-br from-green-600 to-green-700 p-3 sm:p-4 text-center shadow-lg border-2 border-green-700">
                <p className="text-xs sm:text-sm text-green-100 font-medium">
                  Average Accuracy
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {practicedStats.length > 0
                    ? (averageAccuracy * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-md bg-gradient-to-br from-[#d1622b] to-[#ae0d13] p-3 sm:p-4 text-center shadow-lg border-2 border-[#ae0d13]">
                <p className="text-xs sm:text-sm text-orange-100 font-medium">
                  Total Attempts
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {totalAttempts}
                </p>
              </div>
            </div>
          </div>

          {/* Character Progress Table */}
          <div className="rounded-lg bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-xl border-2 border-[#705a39] mx-4">
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-semibold text-[#403933]">
                Character Progress
              </h2>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  data-testid="filter-all"
                  onClick={() => setFilter("all")}
                  className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
                    filter === "all"
                      ? "bg-[#d1622b] text-white border-[#d1622b] shadow-lg"
                      : "bg-white text-[#705a39] border-[#705a39] hover:bg-[#fad182] hover:border-[#d1622b]"
                  }`}
                >
                  All
                </button>
                <button
                  data-testid="filter-hiragana"
                  onClick={() => setFilter("hiragana")}
                  className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
                    filter === "hiragana"
                      ? "bg-[#d1622b] text-white border-[#d1622b] shadow-lg"
                      : "bg-white text-[#705a39] border-[#705a39] hover:bg-[#fad182] hover:border-[#d1622b]"
                  }`}
                >
                  Hiragana
                </button>
                <button
                  data-testid="filter-katakana"
                  onClick={() => setFilter("katakana")}
                  className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
                    filter === "katakana"
                      ? "bg-[#d1622b] text-white border-[#d1622b] shadow-lg"
                      : "bg-white text-[#705a39] border-[#705a39] hover:bg-[#fad182] hover:border-[#d1622b]"
                  }`}
                >
                  Katakana
                </button>
              </div>
            </div>

            {filteredStats.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-[#705a39] text-base sm:text-lg mb-3 sm:mb-4">
                  No character data available yet.
                </p>
                <p className="text-[#705a39] mb-4 sm:mb-6 text-sm sm:text-base">
                  Start practicing to see your progress here!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/hiragana"
                    className="bg-[#d1622b] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#ae0d13] transition-colors font-medium text-sm sm:text-base"
                  >
                    Practice Hiragana
                  </Link>
                  <Link
                    href="/katakana"
                    className="bg-[#705a39] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#403933] transition-colors font-medium text-sm sm:text-base"
                  >
                    Practice Katakana
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full table-auto min-w-[400px]">
                    <thead>
                      <tr className="border-b-2 border-[#705a39] text-left">
                        <th
                          data-testid="sort-character"
                          className="pb-2 sm:pb-3 pt-2 text-xs sm:text-sm font-semibold text-[#403933] cursor-pointer hover:text-[#d1622b] select-none transition-colors duration-200 px-1 sm:px-0"
                          onClick={() => handleSort("character")}
                        >
                          <div className="flex items-center gap-1">
                            Character
                            {sortColumn === "character" && (
                              <span className="text-[#d1622b] text-sm sm:text-lg">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          data-testid="sort-romaji"
                          className="pb-2 sm:pb-3 pt-2 text-xs sm:text-sm font-semibold text-[#403933] cursor-pointer hover:text-[#d1622b] select-none transition-colors duration-200 px-1 sm:px-0"
                          onClick={() => handleSort("romaji")}
                        >
                          <div className="flex items-center gap-1">
                            Romaji
                            {sortColumn === "romaji" && (
                              <span className="text-[#d1622b] text-sm sm:text-lg">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          data-testid="sort-attempts"
                          className="pb-2 sm:pb-3 pt-2 text-xs sm:text-sm font-semibold text-[#403933] cursor-pointer hover:text-[#d1622b] select-none transition-colors duration-200 px-1 sm:px-0"
                          onClick={() => handleSort("attempts")}
                        >
                          <div className="flex items-center gap-1">
                            Attempts
                            {sortColumn === "attempts" && (
                              <span className="text-[#d1622b] text-sm sm:text-lg">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          data-testid="sort-correct-attempts"
                          className="pb-2 sm:pb-3 pt-2 text-xs sm:text-sm font-semibold text-[#403933] cursor-pointer hover:text-[#d1622b] select-none transition-colors duration-200 px-1 sm:px-0"
                          onClick={() => handleSort("correct_attempts")}
                        >
                          <div className="flex items-center gap-1">
                            Correct Attempts
                            {sortColumn === "correct_attempts" && (
                              <span className="text-[#d1622b] text-sm sm:text-lg">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          data-testid="sort-accuracy"
                          className="pb-2 sm:pb-3 pt-2 text-xs sm:text-sm font-semibold text-[#403933] cursor-pointer hover:text-[#d1622b] select-none transition-colors duration-200 px-1 sm:px-0"
                          onClick={() => handleSort("accuracy")}
                        >
                          <div className="flex items-center gap-1">
                            Accuracy
                            {sortColumn === "accuracy" && (
                              <span className="text-[#d1622b] text-sm sm:text-lg">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats.map((kana, index) => (
                        <tr
                          key={kana.id}
                          className={`border-b border-[#705a39]/30 ${index % 2 === 0 ? "bg-white/50" : "bg-[#fad182]/20"} hover:bg-[#fad182]/40 transition-colors duration-200`}
                        >
                          <td className="py-2 sm:py-3 text-lg sm:text-2xl text-[#403933] px-1 sm:px-0">
                            {kana.character}
                          </td>
                          <td className="py-2 sm:py-3 text-[#705a39] font-medium text-xs sm:text-base px-1 sm:px-0">
                            {kana.romaji}
                          </td>
                          <td className="py-2 sm:py-3 text-[#403933] font-medium text-xs sm:text-base px-1 sm:px-0">
                            {kana.attempts}
                          </td>
                          <td className="py-2 sm:py-3 text-[#403933] font-medium text-xs sm:text-base px-1 sm:px-0">
                            {kana.correct_attempts}
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-0">
                            <div className="flex items-center">
                              <div className="mr-2 sm:mr-3 h-2 sm:h-3 w-16 sm:w-24 rounded-full bg-[#705a39]/30 border border-[#705a39]/50">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#d1622b] to-[#ae0d13] transition-all duration-300"
                                  style={{ width: `${kana.accuracy * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-[#403933]">
                                {(kana.accuracy * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Tips Modal */}
      <TipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />
    </div>
  );
}

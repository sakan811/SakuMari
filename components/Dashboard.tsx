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
import TipsModal from "./TipsModal";
import {
  SortableTableHeader,
  StatsCard,
  FilterButton,
} from "./ui/DashboardComponents";
import {
  colors,
  gradients,
  createButtonClass,
  cardStyles,
  tableStyles,
  textStyles,
  utils,
} from "../lib/design-system";
import { LoadingContainer } from "./ui/LoadingSpinner";
import type { KanaData, SortColumn, KanaFilter } from "@/types/kana";
import { isKanaType } from "@/lib/kana-utils";

export default function Dashboard() {
  const [stats, setStats] = useState<KanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<KanaFilter>("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>("accuracy");
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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredStats = stats
    .filter((kana) => isKanaType(kana.character, filter))
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof KanaData] as string | number;
      const bValue = b[sortColumn as keyof KanaData] as string | number;

      const comparison =
        typeof aValue === "string"
          ? aValue.localeCompare(bValue as string)
          : (aValue as number) - (bValue as number);

      return sortDirection === "asc" ? comparison : -comparison;
    });
  const practicedStats = filteredStats.filter((kana) => kana.attempts > 0);
  const averageAccuracy = utils.calculateAverageAccuracy(practicedStats);
  const totalAttempts = filteredStats.reduce(
    (sum, kana) => sum + kana.attempts,
    0,
  );

  if (loading) {
    return (
      <div className={utils.cn(gradients.main, "min-h-screen")}>
        <LoadingContainer />
      </div>
    );
  }

  return (
    <div className={utils.cn(gradients.main, "min-h-screen")}>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 pt-4">
        <h1
          className={utils.cn(
            "text-2xl sm:text-3xl font-bold drop-shadow-sm",
            textStyles.heading.primary,
          )}
        >
          Dashboard
        </h1>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setIsTipsModalOpen(true)}
            className={createButtonClass("primaryGradient")}
          >
            💡 Tips
          </button>
          <Link href="/" className={createButtonClass("primary")}>
            Back to Home
          </Link>
        </div>
      </div>

      {error ? (
        <div
          className={utils.cn(
            cardStyles.base,
            cardStyles.padding,
            "mb-4 sm:mb-6 mx-4",
            `bg-[${colors.error[100]}] border-2 border-[${colors.error[300]}]`,
          )}
        >
          <p
            className={utils.cn(
              "text-center font-medium text-sm sm:text-base",
              `text-[${colors.error[800]}]`,
            )}
          >
            {error}
          </p>
          <div className="text-center mt-3 sm:mt-4">
            <button onClick={fetchStats} className={createButtonClass("error")}>
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div
            className={utils.cn(
              cardStyles.base,
              cardStyles.background,
              cardStyles.padding,
              "mb-4 sm:mb-6 mx-4",
            )}
          >
            <h2
              className={utils.cn(
                "mb-3 sm:mb-4 text-lg sm:text-xl font-semibold",
                textStyles.heading.primary,
              )}
            >
              Your Progress
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              <StatsCard
                title="Total Characters Practiced"
                value={practicedStats.length}
                colorScheme="primary"
              />
              <StatsCard
                title="Average Accuracy"
                value={
                  practicedStats.length > 0
                    ? utils.formatAccuracy(averageAccuracy)
                    : "0%"
                }
                colorScheme="success"
              />
              <StatsCard
                title="Total Attempts"
                value={totalAttempts}
                colorScheme="accent"
              />
            </div>
          </div>

          {/* Character Progress Table */}
          <div
            className={utils.cn(
              cardStyles.base,
              cardStyles.background,
              cardStyles.padding,
              "mx-4",
            )}
          >
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <h2
                className={utils.cn(
                  "text-lg sm:text-xl font-semibold",
                  textStyles.heading.primary,
                )}
              >
                Character Progress
              </h2>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <FilterButton
                  filter="all"
                  currentFilter={filter}
                  label="All"
                  testId="filter-all"
                  onClick={setFilter}
                />
                <FilterButton
                  filter="hiragana"
                  currentFilter={filter}
                  label="Hiragana"
                  testId="filter-hiragana"
                  onClick={setFilter}
                />
                <FilterButton
                  filter="katakana"
                  currentFilter={filter}
                  label="Katakana"
                  testId="filter-katakana"
                  onClick={setFilter}
                />
              </div>
            </div>

            {filteredStats.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p
                  className={utils.cn(
                    "text-base sm:text-lg mb-3 sm:mb-4",
                    textStyles.body,
                  )}
                >
                  No character data available yet.
                </p>
                <p
                  className={utils.cn(
                    "mb-4 sm:mb-6 text-sm sm:text-base",
                    textStyles.body,
                  )}
                >
                  Start practicing to see your progress here!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/hiragana"
                    className={createButtonClass("primary")}
                  >
                    Practice Hiragana
                  </Link>
                  <Link
                    href="/katakana"
                    className={createButtonClass("secondary")}
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
                      <tr
                        className={`border-b-2 border-[${colors.secondary}] text-left`}
                      >
                        <SortableTableHeader
                          column="character"
                          label="Character"
                          testId="sort-character"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          column="romaji"
                          label="Romaji"
                          testId="sort-romaji"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          column="attempts"
                          label="Attempts"
                          testId="sort-attempts"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          column="correct_attempts"
                          label="Correct Attempts"
                          testId="sort-correct-attempts"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          column="accuracy"
                          label="Accuracy"
                          testId="sort-accuracy"
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats.map((kana, index) => (
                        <tr
                          key={kana.id}
                          className={utils.cn(
                            tableStyles.row.base,
                            index % 2 === 0
                              ? tableStyles.row.even
                              : tableStyles.row.odd,
                          )}
                        >
                          <td
                            className={`${tableStyles.cell} text-lg sm:text-2xl text-[${colors.secondaryDark}]`}
                          >
                            {kana.character}
                          </td>
                          <td
                            className={`${tableStyles.cell} text-[${colors.secondary}] font-medium text-xs sm:text-base`}
                          >
                            {kana.romaji}
                          </td>
                          <td
                            className={`${tableStyles.cell} text-[${colors.secondaryDark}] font-medium text-xs sm:text-base`}
                          >
                            {kana.attempts}
                          </td>
                          <td
                            className={`${tableStyles.cell} text-[${colors.secondaryDark}] font-medium text-xs sm:text-base`}
                          >
                            {kana.correct_attempts}
                          </td>
                          <td className={tableStyles.cell}>
                            <div className="flex items-center">
                              <div
                                className={`mr-2 sm:mr-3 h-2 sm:h-3 w-16 sm:w-24 rounded-full bg-[${colors.secondary}]/30 border border-[${colors.secondary}]/50`}
                              >
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r from-[${colors.primary}] to-[${colors.primaryDark}] transition-all duration-300`}
                                  style={{ width: `${kana.accuracy * 100}%` }}
                                ></div>
                              </div>
                              <span
                                className={`text-xs sm:text-sm font-medium text-[${colors.secondaryDark}]`}
                              >
                                {utils.formatAccuracySimple(kana.accuracy)}
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

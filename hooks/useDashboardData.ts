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

import { useState, useEffect } from "react";

import type { KanaWithAccuracy } from "@/types/common";

/**
 * Custom hook for fetching and managing dashboard data
 * @returns Object containing dashboard data, loading state, error state, and refetch function
 */
export function useDashboardData() {
  const [stats, setStats] = useState<KanaWithAccuracy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

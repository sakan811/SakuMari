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

interface SortableTableHeaderProps {
  column: string;
  label: string;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  testId: string;
}

export function SortableTableHeader({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
  testId,
}: SortableTableHeaderProps) {
  return (
    <th
      data-testid={testId}
      className="pb-2 sm:pb-3 pt-2 text-xs sm:text-sm font-semibold text-[#403933] cursor-pointer hover:text-[#d1622b] select-none transition-colors duration-200 px-1 sm:px-0"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          <span className="text-[#d1622b] text-sm sm:text-lg">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );
}

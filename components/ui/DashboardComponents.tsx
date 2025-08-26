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

import {
  colors,
  tableStyles,
  createFilterButtonClass,
  utils,
} from "../../lib/design-system";
import type { SortColumn, KanaFilter } from "@/types/kana";


interface SortableTableHeaderProps {
  column: SortColumn;
  label: string;
  testId: string;
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: SortColumn) => void;
}

export const SortableTableHeader = ({
  column,
  label,
  testId,
  sortColumn,
  sortDirection,
  onSort,
}: SortableTableHeaderProps) => (
  <th
    data-testid={testId}
    className={tableStyles.headerCell}
    onClick={() => onSort(column)}
  >
    <div className="flex items-center gap-1">
      {label}
      {sortColumn === column && (
        <span className={`text-[${colors.primary}] text-sm sm:text-lg`}>
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </div>
  </th>
);

type StatsCardColor = "primary" | "success" | "accent";

interface StatsCardProps {
  title: string;
  value: string | number;
  colorScheme: StatsCardColor;
}

export const StatsCard = ({ title, value, colorScheme }: StatsCardProps) => {
  const colorClasses = {
    primary: {
      bg: `from-[${colors.secondary}] to-[${colors.secondaryDark}]`,
      border: `border-[${colors.secondaryDark}]`,
      text: `text-[${colors.accent}]`,
    },
    success: {
      bg: `from-[${colors.success[600]}] to-[${colors.success[700]}]`,
      border: `border-[${colors.success[700]}]`,
      text: "text-green-100",
    },
    accent: {
      bg: `from-[${colors.primary}] to-[${colors.primaryDark}]`,
      border: `border-[${colors.primaryDark}]`,
      text: "text-orange-100",
    },
  };

  const colorConfig = colorClasses[colorScheme];

  return (
    <div
      className={utils.cn(
        "rounded-md bg-gradient-to-br p-3 sm:p-4 text-center shadow-lg border-2",
        colorConfig.bg,
        colorConfig.border,
      )}
    >
      <p
        className={utils.cn("text-xs sm:text-sm font-medium", colorConfig.text)}
      >
        {title}
      </p>
      <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

interface FilterButtonProps {
  filter: KanaFilter;
  currentFilter: KanaFilter;
  label: string;
  testId: string;
  onClick: (filter: KanaFilter) => void;
}

export const FilterButton = ({
  filter,
  currentFilter,
  label,
  testId,
  onClick,
}: FilterButtonProps) => (
  <button
    data-testid={testId}
    onClick={() => onClick(filter)}
    className={createFilterButtonClass(currentFilter === filter)}
  >
    {label}
  </button>
);

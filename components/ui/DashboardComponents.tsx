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

type SortColumn = "character" | "romaji" | "attempts" | "correct_attempts" | "accuracy";

interface SortableTableHeaderProps {
  column: SortColumn;
  label: string;
  testId: string;
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: SortColumn) => void;
  headerCell: string;
}

export const SortableTableHeader = ({ column, label, testId, sortColumn, sortDirection, onSort, headerCell }: SortableTableHeaderProps) => (
  <th
    data-testid={testId}
    className={headerCell}
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

type StatsCardColor = 'primary' | 'success' | 'accent';

interface StatsCardProps {
  title: string;
  value: string | number;
  colorScheme: StatsCardColor;
}

export const StatsCard = ({ title, value, colorScheme }: StatsCardProps) => {
  const colorClasses = {
    primary: {
      bg: 'from-[#705a39] to-[#403933]',
      border: 'border-[#403933]',
      text: 'text-[#fad182]'
    },
    success: {
      bg: 'from-green-600 to-green-700',
      border: 'border-green-700',
      text: 'text-green-100'
    },
    accent: {
      bg: 'from-[#d1622b] to-[#ae0d13]',
      border: 'border-[#ae0d13]',
      text: 'text-orange-100'
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <div className={`rounded-md bg-gradient-to-br ${colors.bg} p-3 sm:p-4 text-center shadow-lg border-2 ${colors.border}`}>
      <p className={`text-xs sm:text-sm ${colors.text} font-medium`}>
        {title}
      </p>
      <p className="text-xl sm:text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
};

interface FilterButtonProps {
  filter: "all" | "hiragana" | "katakana";
  currentFilter: "all" | "hiragana" | "katakana";
  label: string;
  testId: string;
  onClick: (filter: "all" | "hiragana" | "katakana") => void;
  buttonBase: string;
  filterActive: string;
  filterInactive: string;
}

export const FilterButton = ({ filter, currentFilter, label, testId, onClick, buttonBase, filterActive, filterInactive }: FilterButtonProps) => (
  <button
    data-testid={testId}
    onClick={() => onClick(filter)}
    className={`${buttonBase} ${currentFilter === filter ? filterActive : filterInactive}`}
  >
    {label}
  </button>
);
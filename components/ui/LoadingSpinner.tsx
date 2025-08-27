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

import { utils } from "@/lib/design-system";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  role?: string;
  "aria-label"?: string;
  "data-testid"?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
  role = "status",
  "aria-label": ariaLabel = "Loading",
  "data-testid": testId,
}: LoadingSpinnerProps) {
  return (
    <div
      className={utils.cn(utils.createSpinnerClass(size), className)}
      role={role}
      aria-label={ariaLabel}
      data-testid={testId}
    />
  );
}

export function LoadingContainer({
  size = "md",
  children,
  className = "flex h-32 sm:h-64 items-center justify-center",
}: {
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <LoadingSpinner size={size} data-testid="loading-spinner" />
      {children}
    </div>
  );
}
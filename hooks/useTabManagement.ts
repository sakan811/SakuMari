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

import { useState, Dispatch, SetStateAction } from "react";

export type TabType = "flashcards" | "dashboard";

export interface UseTabManagementReturn {
  activeTab: TabType;
  setActiveTab: Dispatch<SetStateAction<TabType>>;
}

/**
 * Custom hook for managing tab state across components
 * Centralizes the tab management logic used in FlashcardApp and HomePage
 */
export function useTabManagement(initialTab: TabType = "flashcards"): UseTabManagementReturn {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  return {
    activeTab,
    setActiveTab,
  };
}
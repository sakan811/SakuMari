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

import { FC } from "react";
import { FlashcardProvider } from "./FlashcardProvider";
import Flashcard from "./Flashcard";
import Header from "./Header";
import Dashboard from "./Dashboard";
import { commonBackgrounds } from "@/lib/backgrounds";
import { useState } from "react";

interface FlashcardAppProps {
  kanaType?: "hiragana" | "katakana";
}

const FlashcardApp: FC<FlashcardAppProps> = ({ kanaType }) => {
  const [activeTab, setActiveTab] = useState<"flashcards" | "dashboard">(
    "flashcards",
  );

  return (
    <FlashcardProvider kanaType={kanaType}>
      <div className={commonBackgrounds.page}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto max-w-4xl px-4 py-4 sm:py-6 lg:py-8">
          {activeTab === "flashcards" ? <Flashcard /> : <Dashboard />}
        </main>
      </div>
    </FlashcardProvider>
  );
};

export default FlashcardApp;

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

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsSummary } from "../components/StatsSummary";
import type { KanaWithAccuracy } from "../types/common";

describe("StatsSummary Component", () => {
  // Mock data for testing
  const mockStats: KanaWithAccuracy[] = [
    {
      id: "1",
      character: "あ",
      romaji: "a",
      accuracy: 0.8,
      attempts: 10,
      correct_attempts: 8,
    },
    {
      id: "2",
      character: "か",
      romaji: "ka",
      accuracy: 0.6,
      attempts: 5,
      correct_attempts: 3,
    },
    {
      id: "3",
      character: "さ",
      romaji: "sa",
      accuracy: 0,
      attempts: 0,
      correct_attempts: 0,
    },
  ];

  const mockStatsWithNoPractice: KanaWithAccuracy[] = [
    {
      id: "1",
      character: "あ",
      romaji: "a",
      accuracy: 0,
      attempts: 0,
      correct_attempts: 0,
    },
    {
      id: "2",
      character: "か",
      romaji: "ka",
      accuracy: 0,
      attempts: 0,
      correct_attempts: 0,
    },
  ];

  describe("Calculation Logic Tests", () => {
    test("calculates averageAccuracy with empty stats array", () => {
      render(<StatsSummary stats={[]} />);

      // When stats is empty, practicedStats.length is 0, so averageAccuracy should be 0
      const averageAccuracyElement = screen.getByText("0%");
      expect(averageAccuracyElement).toBeTruthy();
    });

    test("calculates averageAccuracy with stats where no kana has been practiced", () => {
      render(<StatsSummary stats={mockStatsWithNoPractice} />);

      // When no kana has been practiced (attempts = 0), practicedStats.length is 0, so averageAccuracy should be 0
      const averageAccuracyElement = screen.getByText("0%");
      expect(averageAccuracyElement).toBeTruthy();
    });

    test("calculates averageAccuracy with stats where some kana have been practiced", () => {
      render(<StatsSummary stats={mockStats} />);

      // practicedStats includes only kana with attempts > 0 (first two entries)
      // averageAccuracy = (0.8 + 0.6) / 2 = 0.7
      // Displayed as percentage with 1 decimal: 70.0%
      const averageAccuracyElement = screen.getByText("70.0%");
      expect(averageAccuracyElement).toBeTruthy();
    });

    test("calculates totalAttempts with empty stats array", () => {
      render(<StatsSummary stats={[]} />);

      // When stats is empty, totalAttempts should be 0
      const totalAttemptsCard = screen
        .getByText("Total Attempts")
        .closest("div");
      const totalAttemptsElement =
        totalAttemptsCard?.querySelector("p.text-xl");
      expect(totalAttemptsElement).toBeTruthy();
      expect(totalAttemptsElement?.textContent).toBe("0");
    });

    test("calculates totalAttempts with stats containing various attempt counts", () => {
      render(<StatsSummary stats={mockStats} />);

      // totalAttempts = 10 + 5 + 0 = 15
      const totalAttemptsElement = screen.getByText("15");
      expect(totalAttemptsElement).toBeTruthy();
    });
  });

  describe("Rendering Tests", () => {
    test("renders with correct structure", () => {
      render(<StatsSummary stats={mockStats} />);

      // Main container
      const mainContainer = screen.getByText("Your Progress").closest("div");
      expect(mainContainer).toBeTruthy();
      expect(mainContainer?.className).toContain("rounded-lg");
      expect(mainContainer?.className).toContain("bg-white/90");
      expect(mainContainer?.className).toContain("backdrop-blur-sm");

      // Title
      expect(screen.getByText("Your Progress")).toBeTruthy();
      expect(screen.getByText("Your Progress").className).toContain("text-lg");
      expect(screen.getByText("Your Progress").className).toContain(
        "font-semibold",
      );

      // Grid container for cards
      const gridContainer = mainContainer?.querySelector("div");
      expect(gridContainer).toBeTruthy();
      expect(gridContainer?.className).toContain("grid");
      expect(gridContainer?.className).toContain("grid-cols-1");
      expect(gridContainer?.className).toContain("sm:grid-cols-3");
    });

    test("renders three stat cards", () => {
      render(<StatsSummary stats={mockStats} />);

      // Check that all three card titles are present
      expect(screen.getByText("Total Characters Practiced")).toBeTruthy();
      expect(screen.getByText("Average Accuracy")).toBeTruthy();
      expect(screen.getByText("Total Attempts")).toBeTruthy();

      // Check that there are three cards by finding the stat containers
      const cards = screen
        .getAllByText(
          /Total Characters Practiced|Average Accuracy|Total Attempts/,
        )
        .map((title) => title.closest("div"))
        .filter((card) => card?.className.includes("rounded-md"));

      expect(cards.length).toBe(3);
    });

    test("applies correct styling classes", () => {
      render(<StatsSummary stats={mockStats} />);

      // Check struggling card styling (Total Characters Practiced)
      const strugglingCard = screen
        .getByText("Total Characters Practiced")
        .closest("div");
      expect(strugglingCard?.className).toContain("rounded-md");
      expect(strugglingCard?.className).toContain("bg-gradient-to-br");
      expect(strugglingCard?.className).toContain("from-[#705a39]");
      expect(strugglingCard?.className).toContain("to-[#403933]");
      expect(strugglingCard?.className).toContain("border-2");
      expect(strugglingCard?.className).toContain("border-[#403933]");

      // Check good card styling (Average Accuracy)
      const goodCard = screen.getByText("Average Accuracy").closest("div");
      expect(goodCard?.className).toContain("rounded-md");
      expect(goodCard?.className).toContain("bg-gradient-to-br");
      expect(goodCard?.className).toContain("from-green-600");
      expect(goodCard?.className).toContain("to-green-700");
      expect(goodCard?.className).toContain("border-2");
      expect(goodCard?.className).toContain("border-green-700");

      // Check excellent card styling (Total Attempts)
      const excellentCard = screen.getByText("Total Attempts").closest("div");
      expect(excellentCard?.className).toContain("rounded-md");
      expect(excellentCard?.className).toContain("bg-gradient-to-br");
      expect(excellentCard?.className).toContain("from-[#d1622b]");
      expect(excellentCard?.className).toContain("to-[#ae0d13]");
      expect(excellentCard?.className).toContain("border-2");
      expect(excellentCard?.className).toContain("border-[#ae0d13]");
    });
  });

  describe("Data Display Tests", () => {
    test("displays Total Characters Practiced correctly", () => {
      render(<StatsSummary stats={mockStats} />);

      // practicedStats includes only kana with attempts > 0 (first two entries)
      // So Total Characters Practiced should be 2
      const totalCharactersCard = screen
        .getByText("Total Characters Practiced")
        .closest("div");
      const totalCharactersElement =
        totalCharactersCard?.querySelector("p.text-xl");
      expect(totalCharactersElement).toBeTruthy();
      expect(totalCharactersElement?.textContent).toBe("2");
      expect(totalCharactersElement?.className).toContain("text-xl");
      expect(totalCharactersElement?.className).toContain("font-bold");
      expect(totalCharactersElement?.className).toContain("text-white");
    });

    test("displays Average Accuracy correctly", () => {
      render(<StatsSummary stats={mockStats} />);

      // practicedStats includes only kana with attempts > 0 (first two entries)
      // averageAccuracy = (0.8 + 0.6) / 2 = 0.7
      // Displayed as percentage with 1 decimal: 70.0%
      const averageAccuracyCard = screen
        .getByText("Average Accuracy")
        .closest("div");
      const averageAccuracyElement =
        averageAccuracyCard?.querySelector("p.text-xl");
      expect(averageAccuracyElement).toBeTruthy();
      expect(averageAccuracyElement?.textContent).toBe("70.0%");
      expect(averageAccuracyElement?.className).toContain("text-xl");
      expect(averageAccuracyElement?.className).toContain("font-bold");
      expect(averageAccuracyElement?.className).toContain("text-white");
    });

    test("displays Total Attempts correctly", () => {
      render(<StatsSummary stats={mockStats} />);

      // totalAttempts = 10 + 5 + 0 = 15
      const totalAttemptsCard = screen
        .getByText("Total Attempts")
        .closest("div");
      const totalAttemptsElement =
        totalAttemptsCard?.querySelector("p.text-xl");
      expect(totalAttemptsElement).toBeTruthy();
      expect(totalAttemptsElement?.textContent).toBe("15");
      expect(totalAttemptsElement?.className).toContain("text-xl");
      expect(totalAttemptsElement?.className).toContain("font-bold");
      expect(totalAttemptsElement?.className).toContain("text-white");
    });

    test("displays 0% accuracy when no kana have been practiced", () => {
      render(<StatsSummary stats={mockStatsWithNoPractice} />);

      // When no kana has been practiced, accuracy should display as 0%
      const averageAccuracyCard = screen
        .getByText("Average Accuracy")
        .closest("div");
      const averageAccuracyElement =
        averageAccuracyCard?.querySelector("p.text-xl");
      expect(averageAccuracyElement).toBeTruthy();
      expect(averageAccuracyElement?.textContent).toBe("0%");
    });

    test("displays 0 for Total Characters Practiced when no kana have been practiced", () => {
      render(<StatsSummary stats={mockStatsWithNoPractice} />);

      // When no kana has been practiced, Total Characters Practiced should be 0
      const totalCharactersCard = screen
        .getByText("Total Characters Practiced")
        .closest("div");
      const totalCharactersElement =
        totalCharactersCard?.querySelector("p.text-xl");
      expect(totalCharactersElement).toBeTruthy();
      expect(totalCharactersElement?.textContent).toBe("0");
    });

    test("displays 0 for Total Attempts when no kana have been practiced", () => {
      render(<StatsSummary stats={mockStatsWithNoPractice} />);

      // When no kana has been practiced, Total Attempts should be 0
      const totalAttemptsCard = screen
        .getByText("Total Attempts")
        .closest("div");
      const totalAttemptsElement =
        totalAttemptsCard?.querySelector("p.text-xl");
      expect(totalAttemptsElement).toBeTruthy();
      expect(totalAttemptsElement?.textContent).toBe("0");
    });

    test("displays 0 for all stats when stats array is empty", () => {
      render(<StatsSummary stats={[]} />);

      // When stats array is empty, all values should be 0
      // Check each stat individually to ensure we're getting the right elements
      const totalCharactersCard = screen
        .getByText("Total Characters Practiced")
        .closest("div");
      const totalCharactersElement =
        totalCharactersCard?.querySelector("p.text-xl");
      expect(totalCharactersElement?.textContent).toBe("0");

      const averageAccuracyCard = screen
        .getByText("Average Accuracy")
        .closest("div");
      const averageAccuracyElement =
        averageAccuracyCard?.querySelector("p.text-xl");
      expect(averageAccuracyElement?.textContent).toBe("0%");

      const totalAttemptsCard = screen
        .getByText("Total Attempts")
        .closest("div");
      const totalAttemptsElement =
        totalAttemptsCard?.querySelector("p.text-xl");
      expect(totalAttemptsElement?.textContent).toBe("0");
    });
  });
});

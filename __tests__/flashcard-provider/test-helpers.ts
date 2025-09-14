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

import { vi } from "vitest";
import type { FlashcardContextType } from "@/components/FlashcardProvider";

// Mock fetch for API calls
export const mockFetch = vi.fn();
global.fetch = mockFetch;

// Common test data
export const mockKanaData = [
  { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
  { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
  { id: "3", character: "う", romaji: "u", accuracy: 0.7 },
];

export const emptyKanaData = [];

export const perfectAccuracyKanaData = [
  { id: "1", character: "あ", romaji: "a", accuracy: 1.0 },
  { id: "2", character: "い", romaji: "i", accuracy: 1.0 },
];

export const zeroAccuracyKanaData = [
  { id: "1", character: "あ", romaji: "a", accuracy: 0.0 },
  { id: "2", character: "い", romaji: "i", accuracy: 0.0 },
];

// Test component to access provider context
export function TestComponent({
  onContext,
  showMultipleChoice = false
}: {
  onContext: (context: FlashcardContextType | undefined) => void;
  showMultipleChoice?: boolean;
}) {
  const context = require("@/components/FlashcardProvider").useFlashcard();
  const React = require("react");

  React.useEffect(() => {
    onContext(context);
  }, [context, onContext]);

  return React.createElement("div", null,
    React.createElement("button", {
      "data-testid": "next-card",
      onClick: context.nextCard
    }, "Next Card"),
    React.createElement("button", {
      "data-testid": "submit-answer",
      onClick: () => context.submitAnswer("test")
    }, "Submit Answer"),
    React.createElement("button", {
      "data-testid": "set-multiple-choice",
      onClick: () => context.setInteractionMode("multiple-choice")
    }, "Set Multiple Choice"),
    showMultipleChoice && React.createElement(require("@/components/MultipleChoice").default, {
      choices: context.choices,
      selectedChoice: null,
      onChoiceSelect: vi.fn()
    })
  );
}

// Setup successful API response
export function setupSuccessfulApiResponse(data = mockKanaData) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

// Setup failed API response
export function setupFailedApiResponse(status = 500, errorData = {}) {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
    statusText: "Internal Server Error",
    json: async () => ({ error: "Server error", ...errorData }),
  });
}

// Setup network error
export function setupNetworkError() {
  mockFetch.mockRejectedValue(new Error("Network error"));
}

// Setup mock for API endpoints
export function setupMockApiEndpoints(kanaData = mockKanaData, submitResponse = { ok: true }) {
  mockFetch.mockImplementation((url: string) => {
    if (url === "/api/stats") {
      return Promise.resolve({
        ok: true,
        json: async () => kanaData,
      });
    } else if (url === "/api/flashcards/submit") {
      return Promise.resolve(submitResponse);
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
  });
}

// Wait for context to be available
export async function waitForContext(capturedContext: any) {
  const { waitFor } = await import("@testing-library/react");
  await waitFor(() => {
    expect(capturedContext).toBeDefined();
    expect(capturedContext.loadingKana).toBe(false);
  });
}

// Common test assertions
export function expectBasicContextProperties(context: any) {
  expect(context).toHaveProperty("currentKana");
  expect(context).toHaveProperty("submitAnswer");
  expect(context).toHaveProperty("nextCard");
  expect(context).toHaveProperty("loadingKana");
  expect(context).toHaveProperty("result");
}

// Test parameterization utilities
export interface TestCase {
  name: string;
  data: any[];
  expectedBehavior: string;
  setup?: () => void;
}

export function runParameterizedTests(
  testCases: TestCase[],
  testFn: (testCase: TestCase) => Promise<void> | void
) {
  testCases.forEach((testCase) => {
    it(testCase.name, async () => {
      if (testCase.setup) {
        testCase.setup();
      }
      await testFn(testCase);
    });
  });
}
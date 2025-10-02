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

/**
 * Creates a mock session object for testing NextAuth auth() function
 * @param authenticated - Whether the user is authenticated
 * @param userOverrides - Override properties for the user object
 * @returns Mock session object compatible with NextAuth auth()
 */
export function mockSession(authenticated = true, userOverrides = {}) {
  return authenticated
    ? {
        user: {
          id: "user123",
          name: "Test User",
          email: "test@example.com",
          ...userOverrides,
        },
      }
    : null;
}

/**
 * Creates a mock API response for testing
 * @param data - The data to return in the response
 * @param ok - Whether the response is successful
 * @param status - HTTP status code
 * @returns Mock response object
 */
export function mockApiResponse(
  data: unknown,
  ok = true,
  status = 200,
): Response {
  return {
    ok,
    status: ok ? status : 500,
    statusText: ok ? "OK" : "Internal Server Error",
    headers: new Headers(),
    url: "",
    redirected: false,
    type: "basic",
    body: null,
    bodyUsed: false,
    json: async () => data,
    text: async () => JSON.stringify(data),
    clone: () => mockApiResponse(data, ok, status),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    arrayBuffer: async () => new ArrayBuffer(0),
  } as Response;
}

/**
 * Creates mock kana data for testing
 * @param overrides - Override properties for the kana object
 * @returns Mock kana object
 */
export function mockKanaData(overrides = {}) {
  return {
    id: "1",
    character: "あ",
    romaji: "a",
    attempts: 10,
    correct_attempts: 8,
    accuracy: 0.8,
    ...overrides,
  };
}

/**
 * Creates a mock FlashcardProvider context value for testing
 * @param overrides - Override properties for the provider
 * @returns Mock FlashcardProvider object
 */
export function mockFlashcardProvider(overrides = {}) {
  return {
    currentKana: null,
    loadingKana: false,
    submitAnswer: vi.fn(),
    result: null,
    nextCard: vi.fn(),
    interactionMode: "typing",
    setInteractionMode: vi.fn(),
    choices: [],
    isSubmitting: false,
    error: null,
    clearError: vi.fn(),
    ...overrides,
  };
}

/**
 * Creates a mock Next.js router object for testing
 * @param overrides - Override properties for the router
 * @returns Mock router object
 */
export function mockRouter(overrides = {}) {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    ...overrides,
  };
}

/**
 * Creates a mock Next.js useSearchParams hook for testing
 * @param params - Search parameters to return
 * @returns Mock useSearchParams function
 */
export function mockUseSearchParams(params: Record<string, string> = {}) {
  return {
    get: (key: string) => params[key] || null,
    getAll: (key: string) => (params[key] ? [params[key]] : []),
    has: (key: string) => key in params,
    toString: () => new URLSearchParams(params).toString(),
  };
}

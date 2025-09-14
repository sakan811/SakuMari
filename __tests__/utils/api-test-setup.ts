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
import { NextRequest } from "next/server";
import { mockSession } from "./mock-setup";

/**
 * Creates standard NextAuth and Prisma mocks for API tests
 */
export function createApiTestMocks() {
  const { mockAuth, mockPrisma } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
    mockPrisma: {
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn(),
      kana: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      kanaProgress: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
      },
    },
  }));

  vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
  vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

  return { mockAuth, mockPrisma };
}

/**
 * Creates a mock Prisma client with raw SQL support
 */
export function createMockPrismaClient(overrides: Record<string, unknown> = {}) {
  return {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    kana: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      ...(overrides?.kana as Record<string, unknown> || {}),
    },
    kanaProgress: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      ...(overrides?.kanaProgress as Record<string, unknown> || {}),
    },
    ...overrides,
  };
}

/**
 * Sets up standard API test environment with authentication and database mocks
 */
export function setupApiTestEnvironment() {
  const { mockAuth, mockPrisma } = createApiTestMocks();

  const beforeEachHook = () => {
    vi.clearAllMocks();
  };

  const afterEachHook = () => {
    vi.restoreAllMocks();
  };

  return {
    mockAuth,
    mockPrisma,
    beforeEach: beforeEachHook,
    afterEach: afterEachHook,
    mockSession,
  };
}

/**
 * Creates a standard authenticated session setup
 */
export function createAuthenticatedSession(userOverrides = {}) {
  return mockSession(true, { id: "user123", ...userOverrides });
}

/**
 * Creates a standard unauthenticated session setup
 */
export function createUnauthenticatedSession() {
  return mockSession(false);
}

/**
 * Creates a mock NextRequest with JSON body
 */
export function createMockRequest(
  url: string,
  method: string = "GET",
  body?: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Creates a standard POST request for flashcard submit API
 */
export function createFlashcardSubmitRequest(
  kanaId: string,
  isCorrect: boolean,
  additionalData: Record<string, unknown> = {}
) {
  return createMockRequest(
    "http://localhost/api/flashcards/submit",
    "POST",
    { kanaId, isCorrect, ...additionalData }
  );
}

/**
 * Creates mock kana data for API responses
 */
export function createMockKanaData(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-kana-id",
    character: "あ",
    romaji: "a",
    attempts: 10,
    correct_attempts: 8,
    accuracy: 0.8,
    ...overrides,
  };
}

/**
 * Creates mock kana progress data for API responses
 */
export function createMockKanaProgressData(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-progress-id",
    kana_id: "test-kana-id",
    user_id: "user123",
    attempts: 10,
    correct_attempts: 8,
    accuracy: 0.8,
    ...overrides,
  };
}

/**
 * Sets up database error scenario for API tests
 */
export function setupDatabaseError(mockPrisma: ReturnType<typeof createMockPrismaClient>, errorMessage: string = "Database connection failed") {
  mockPrisma.$queryRaw.mockRejectedValue(new Error(errorMessage));
  mockPrisma.$executeRaw.mockRejectedValue(new Error(errorMessage));
  mockPrisma.kana.findMany.mockRejectedValue(new Error(errorMessage));
  mockPrisma.kana.findFirst.mockRejectedValue(new Error(errorMessage));
  mockPrisma.kanaProgress.findMany.mockRejectedValue(new Error(errorMessage));
  mockPrisma.kanaProgress.findFirst.mockRejectedValue(new Error(errorMessage));
  mockPrisma.kanaProgress.upsert.mockRejectedValue(new Error(errorMessage));
}
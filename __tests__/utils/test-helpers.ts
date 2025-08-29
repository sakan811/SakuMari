import { vi } from "vitest";

export const mockKana = {
  basic: { id: "1", character: "あ", romaji: "a", accuracy: 0.7 },
  withStats: {
    id: "1",
    character: "あ",
    romaji: "a",
    attempts: 10,
    correct_attempts: 8,
    accuracy: 0.8,
  },
};

export const mockFlashcardProvider = (overrides = {}) => ({
  currentKana: null,
  loadingKana: false,
  submitAnswer: vi.fn(),
  result: null,
  nextCard: vi.fn(),
  interactionMode: "typing",
  setInteractionMode: vi.fn(),
  choices: [],
  isSubmitting: false,
  ...overrides,
});

export const mockApiResponse = (data: unknown, ok = true) => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => data,
});

export const mockSession = (authenticated = true) => ({
  data: authenticated ? { user: { id: "user123", name: "Test User" } } : null,
  status: authenticated ? "authenticated" : "unauthenticated",
});

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

export const mockApiResponse = (data: any, ok = true) => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => data,
});

export const mockSession = (authenticated = true) => ({
  data: authenticated ? { user: { id: "user123", name: "Test User" } } : null,
  status: authenticated ? "authenticated" : "unauthenticated",
});

// Standardized mock factories for API tests
export const createMockFactories = () => {
  return {
    // Auth mock factory
    createAuthMock: () => {
      const authMock = vi.fn();
      return {
        mock: authMock,
        mockAuthenticated: (userId = "user123") => authMock.mockResolvedValue({ user: { id: userId } }),
        mockUnauthenticated: () => authMock.mockResolvedValue(null),
        mockInvalidSession: () => authMock.mockResolvedValue({ user: {} }),
      };
    },

    // Prisma mock factory
    createPrismaMock: () => {
      const prismaMock = {
        kana: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        kanaProgress: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          upsert: vi.fn(),
        },
        $queryRaw: vi.fn(),
      };
      
      return {
        mock: prismaMock,
        mockDatabaseSuccess: () => prismaMock.$queryRaw.mockResolvedValue([1]),
        mockDatabaseError: (error = new Error("Database connection failed")) => 
          prismaMock.$queryRaw.mockRejectedValue(error),
        mockKanaData: (data = [mockKana.withStats]) => prismaMock.kana.findMany.mockResolvedValue(data),
      };
    },
  };
};

// Common test setup helper
export const setupApiTest = () => {
  const { createAuthMock, createPrismaMock } = createMockFactories();
  
  return {
    auth: createAuthMock(),
    prisma: createPrismaMock(),
    cleanup: () => {
      vi.clearAllMocks();
    },
    reset: () => {
      vi.restoreAllMocks();
    },
  };
};

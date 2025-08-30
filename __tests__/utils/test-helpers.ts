// Re-export functions from mock-setup for backward compatibility
export { 
  mockFlashcardProvider,
  mockApiResponse,
  mockSession
} from "./mock-setup";

// For backward compatibility, maintain the old mockKana structure
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

// Export mockKanaData as a separate function for new usage
export { mockKanaData } from "./mock-setup";

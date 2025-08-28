import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import {
  FlashcardProvider,
  useFlashcard,
} from "../components/FlashcardProvider";

// Use global mock fetch
const mockFetch = global.mockFetch;

describe("FlashcardProvider", () => {
  beforeEach(() => {
    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.8,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("throws if useFlashcard is used outside provider", () => {
    // This should throw an error
    expect(() => renderHook(() => useFlashcard())).toThrow(
      "useFlashcard must be used within a FlashcardProvider",
    );
  });

  it("provides context to children", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FlashcardProvider kanaType="hiragana">{children}</FlashcardProvider>
    );

    const { result } = renderHook(() => useFlashcard(), { wrapper });

    expect(result.current).toHaveProperty("currentKana");
    expect(result.current).toHaveProperty("submitAnswer");
    expect(result.current).toHaveProperty("nextCard");
    expect(result.current).toHaveProperty("loadingKana");
    expect(result.current).toHaveProperty("result");
  });
});

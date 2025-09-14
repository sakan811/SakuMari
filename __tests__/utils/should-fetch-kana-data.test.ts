import { describe, it, expect } from "vitest";
import { shouldFetchKanaData } from "@/lib/should-fetch-kana-data";

describe("shouldFetchKanaData", () => {
  it("should return true when hasFetched is false", () => {
    expect(shouldFetchKanaData(false)).toBe(true);
    expect(shouldFetchKanaData(false, "hiragana")).toBe(true);
    expect(shouldFetchKanaData(false, "katakana")).toBe(true);
  });

  it("should return true when hasFetched is true but kanaType is provided", () => {
    expect(shouldFetchKanaData(true, "hiragana")).toBe(true);
    expect(shouldFetchKanaData(true, "katakana")).toBe(true);
  });

  it("should return false when hasFetched is true and kanaType is undefined", () => {
    expect(shouldFetchKanaData(true)).toBe(false);
    expect(shouldFetchKanaData(true, undefined)).toBe(false);
  });

  it("should handle all boolean combinations", () => {
    // Test all possible combinations
    const testCases = [
      { hasFetched: false, kanaType: undefined, expected: true },
      { hasFetched: false, kanaType: "hiragana", expected: true },
      { hasFetched: false, kanaType: "katakana", expected: true },
      { hasFetched: true, kanaType: undefined, expected: false },
      { hasFetched: true, kanaType: "hiragana", expected: true },
      { hasFetched: true, kanaType: "katakana", expected: true },
    ];

    testCases.forEach(({ hasFetched, kanaType, expected }) => {
      expect(shouldFetchKanaData(hasFetched, kanaType)).toBe(expected);
    });
  });
});
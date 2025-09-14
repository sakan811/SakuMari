import { describe, it, expect } from "vitest";
import { shouldFetchKanaData } from "@/lib/should-fetch-kana-data";

describe("shouldFetchKanaData", () => {
  it("should return true when hasFetched is false", () => {
    expect(shouldFetchKanaData(false)).toBe(true);
    expect(shouldFetchKanaData(false, "hiragana")).toBe(true);
    expect(shouldFetchKanaData(false, "katakana")).toBe(true);
  });

  it("should return true when kanaType differs from previousKanaType", () => {
    expect(shouldFetchKanaData(true, "hiragana", undefined)).toBe(true);
    expect(shouldFetchKanaData(true, "katakana", undefined)).toBe(true);
    expect(shouldFetchKanaData(true, "hiragana", "katakana")).toBe(true);
    expect(shouldFetchKanaData(true, "katakana", "hiragana")).toBe(true);
  });

  it("should return false when hasFetched is true and kanaType is same as previousKanaType", () => {
    expect(shouldFetchKanaData(true)).toBe(false);
    expect(shouldFetchKanaData(true, undefined, undefined)).toBe(false);
    expect(shouldFetchKanaData(true, "hiragana", "hiragana")).toBe(false);
    expect(shouldFetchKanaData(true, "katakana", "katakana")).toBe(false);
  });

  it("should handle all combinations", () => {
    // Test all possible combinations
    const testCases = [
      { hasFetched: false, kanaType: undefined, previousKanaType: undefined, expected: true },
      { hasFetched: false, kanaType: "hiragana", previousKanaType: undefined, expected: true },
      { hasFetched: false, kanaType: "katakana", previousKanaType: undefined, expected: true },
      { hasFetched: true, kanaType: undefined, previousKanaType: undefined, expected: false },
      { hasFetched: true, kanaType: "hiragana", previousKanaType: undefined, expected: true },
      { hasFetched: true, kanaType: "katakana", previousKanaType: undefined, expected: true },
      { hasFetched: true, kanaType: "hiragana", previousKanaType: "hiragana", expected: false },
      { hasFetched: true, kanaType: "katakana", previousKanaType: "hiragana", expected: true },
    ];

    testCases.forEach(({ hasFetched, kanaType, previousKanaType, expected }) => {
      expect(shouldFetchKanaData(hasFetched, kanaType, previousKanaType)).toBe(expected);
    });
  });
});
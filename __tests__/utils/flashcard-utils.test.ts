import { describe, it, expect, vi } from "vitest";
import {
  calculateKanaWeights,
  selectKanaByWeight,
  generateChoicesArray,
  filterKanaByType,
  shouldPreventSubmission,
} from "@/lib/flashcard-utils";
import type { KanaWithAccuracy } from "@/types/common";

describe("Flashcard Utils", () => {
  describe("calculateKanaWeights", () => {
    it("should give high priority to new characters (attempts = 0)", () => {
      const kanaList: KanaWithAccuracy[] = [
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
          character: "い",
          romaji: "i",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        },
      ];

      const weights = calculateKanaWeights(kanaList);

      // New character should get weight of 2.0
      expect(weights[0]).toBe(2.0);
      // Character with attempts should get calculated weight
      expect(weights[1]).toBeGreaterThan(0);
      expect(weights[1]).toBeLessThan(2.0);
    });

    it("should calculate accuracy weight correctly", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        },
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        },
      ];

      const weights = calculateKanaWeights(kanaList);

      // Lower accuracy should get higher weight
      expect(weights[0]).toBeGreaterThan(weights[1]);
      expect(weights[0]).toBeCloseTo(0.7, 1); // 1 - 0.3 = 0.7
      expect(weights[1]).toBeCloseTo(0.3, 1); // 1 - 0.7 = 0.3
    });

    it("should apply confidence boost for high accuracy with few attempts", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.9,
          attempts: 1,
          correct_attempts: 1,
        }, // Gets boost
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.9,
          attempts: 5,
          correct_attempts: 5,
        }, // No boost
        {
          id: "3",
          character: "う",
          romaji: "u",
          accuracy: 0.7,
          attempts: 1,
          correct_attempts: 1,
        }, // No boost (accuracy too low)
      ];

      const weights = calculateKanaWeights(kanaList);

      // First character should get confidence boost: (1 - 0.9) * (1 + (3-1) * 0.5) = 0.1 * 2.0 = 0.2
      expect(weights[0]).toBeCloseTo(0.2, 1);
      // Second character should not get boost: (1 - 0.9) * 1 = 0.1
      expect(weights[1]).toBeCloseTo(0.1, 1);
      // Third character should not get boost: (1 - 0.7) * 1 = 0.3
      expect(weights[2]).toBeCloseTo(0.3, 1);
    });

    it("should handle edge case with maximum accuracy", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 1.0,
          attempts: 2,
          correct_attempts: 2,
        },
      ];

      const weights = calculateKanaWeights(kanaList);

      // Should handle perfect accuracy gracefully
      expect(weights[0]).toBeGreaterThanOrEqual(0);
      expect(weights[0]).toBeLessThanOrEqual(2.0);
    });

    it("should apply minimum weight threshold", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.95,
          attempts: 10,
          correct_attempts: 10,
        },
      ];

      const weights = calculateKanaWeights(kanaList);

      // Even with very high accuracy, weight should be at least 0.1
      expect(weights[0]).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe("selectKanaByWeight", () => {
    it("should return null for empty kana list", () => {
      const result = selectKanaByWeight([], []);
      expect(result).toBeNull();
    });

    it("should return null for mismatched array lengths", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        },
      ];
      const weights = [0.5, 0.3]; // Different length

      const result = selectKanaByWeight(kanaList, weights);
      expect(result).toBeNull();
    });

    it("should return null for empty weights", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        },
      ];

      const result = selectKanaByWeight(kanaList, []);
      expect(result).toBeNull();
    });

    it("should select kana based on weighted probability", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        },
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        },
      ];
      const weights = [0.7, 0.3]; // First kana has higher weight

      // Mock Math.random to control selection
      const originalRandom = Math.random;
      let _callCount = 0;
      Math.random = vi
        .fn()
        .mockReturnValueOnce(0.5) // Should select first kana (0.5 < 0.7)
        .mockReturnValueOnce(0.8); // Should select second kana (0.8 - 0.7 = 0.1 <= 0.3)

      const result1 = selectKanaByWeight(kanaList, weights);
      expect(result1).toBe(kanaList[0]);

      const result2 = selectKanaByWeight(kanaList, weights);
      expect(result2).toBe(kanaList[1]);

      Math.random = originalRandom;
    });

    it("should fallback to last kana if no selection is made", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        },
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        },
      ];
      const weights = [0.1, 0.1];

      // Mock Math.random to return a value that won't trigger selection
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.99);

      const result = selectKanaByWeight(kanaList, weights);
      expect(result).toBe(kanaList[1]); // Should fallback to last kana

      Math.random = originalRandom;
    });
  });

  describe("filterKanaByType", () => {
    it("should return original array when no kanaType specified", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        },
        {
          id: "2",
          character: "ア",
          romaji: "a",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        },
      ];

      const result = filterKanaByType(kanaList);
      expect(result).toEqual(kanaList);
    });

    it("should filter hiragana characters correctly", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        }, // Hiragana
        {
          id: "2",
          character: "ア",
          romaji: "a",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        }, // Katakana
        {
          id: "3",
          character: "い",
          romaji: "i",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        }, // Hiragana
      ];

      const result = filterKanaByType(kanaList, "hiragana");
      expect(result).toHaveLength(2);
      expect(result.map((k) => k.character)).toEqual(["あ", "い"]);
    });

    it("should filter katakana characters correctly", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        }, // Hiragana
        {
          id: "2",
          character: "ア",
          romaji: "a",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        }, // Katakana
        {
          id: "3",
          character: "イ",
          romaji: "i",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        }, // Katakana
      ];

      const result = filterKanaByType(kanaList, "katakana");
      expect(result).toHaveLength(2);
      expect(result.map((k) => k.character)).toEqual(["ア", "イ"]);
    });

    it("should return empty array when no characters match the type", () => {
      const kanaList: KanaWithAccuracy[] = [
        {
          id: "1",
          character: "あ",
          romaji: "a",
          accuracy: 0.5,
          attempts: 5,
          correct_attempts: 3,
        }, // Hiragana
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        }, // Hiragana
      ];

      const result = filterKanaByType(kanaList, "katakana");
      expect(result).toHaveLength(0);
    });
  });

  describe("shouldPreventSubmission", () => {
    it("should prevent submission when currentKana is null", () => {
      const result = shouldPreventSubmission(null, false);
      expect(result).toBe(true);
    });

    it("should prevent submission when isSubmitting is true", () => {
      const kana: KanaWithAccuracy = {
        id: "1",
        character: "あ",
        romaji: "a",
        accuracy: 0.5,
        attempts: 5,
        correct_attempts: 3,
      };
      const result = shouldPreventSubmission(kana, true);
      expect(result).toBe(true);
    });

    it("should allow submission when currentKana exists and not submitting", () => {
      const kana: KanaWithAccuracy = {
        id: "1",
        character: "あ",
        romaji: "a",
        accuracy: 0.5,
        attempts: 5,
        correct_attempts: 3,
      };
      const result = shouldPreventSubmission(kana, false);
      expect(result).toBe(false);
    });

    it("should prevent submission when both conditions are true", () => {
      const result = shouldPreventSubmission(null, true);
      expect(result).toBe(true);
    });
  });

  describe("generateChoicesArray", () => {
    it("should return empty array for empty kanaData", () => {
      const correctKana: KanaWithAccuracy = {
        id: "1",
        character: "あ",
        romaji: "a",
        accuracy: 0.5,
        attempts: 5,
        correct_attempts: 3,
      };

      const result = generateChoicesArray(correctKana, []);
      expect(result).toEqual([]);
    });

    it("should return only correct answer when no other kana available", () => {
      const correctKana: KanaWithAccuracy = {
        id: "1",
        character: "あ",
        romaji: "a",
        accuracy: 0.5,
        attempts: 5,
        correct_attempts: 3,
      };

      const result = generateChoicesArray(correctKana, [correctKana]);
      expect(result).toEqual(["a"]);
    });

    it("should generate choices with correct answer and wrong answers", () => {
      const correctKana: KanaWithAccuracy = {
        id: "1",
        character: "あ",
        romaji: "a",
        accuracy: 0.5,
        attempts: 5,
        correct_attempts: 3,
      };
      const kanaData: KanaWithAccuracy[] = [
        correctKana,
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        },
        {
          id: "3",
          character: "う",
          romaji: "u",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        },
        {
          id: "4",
          character: "え",
          romaji: "e",
          accuracy: 0.4,
          attempts: 5,
          correct_attempts: 2,
        },
      ];

      const result = generateChoicesArray(correctKana, kanaData);

      expect(result).toHaveLength(4); // 1 correct + 3 wrong
      expect(result).toContain("a"); // Correct answer should be included
      expect(result).toContain("i"); // Wrong answer should be included
      expect(result).toContain("u"); // Wrong answer should be included
      expect(result).toContain("e"); // Wrong answer should be included
    });

    it("should handle duplicate romaji values correctly", () => {
      const correctKana: KanaWithAccuracy = {
        id: "1",
        character: "あ",
        romaji: "a",
        accuracy: 0.5,
        attempts: 5,
        correct_attempts: 3,
      };
      const kanaData: KanaWithAccuracy[] = [
        correctKana,
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        },
        {
          id: "3",
          character: "う",
          romaji: "i",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        }, // Duplicate romaji
        {
          id: "4",
          character: "え",
          romaji: "e",
          accuracy: 0.4,
          attempts: 5,
          correct_attempts: 2,
        },
        {
          id: "5",
          character: "お",
          romaji: "u",
          accuracy: 0.6,
          attempts: 5,
          correct_attempts: 3,
        },
        {
          id: "6",
          character: "か",
          romaji: "ka",
          accuracy: 0.8,
          attempts: 5,
          correct_attempts: 4,
        },
      ];

      // Mock Math.random to make the test deterministic
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.5); // Will sort in predictable order

      const result = generateChoicesArray(correctKana, kanaData);

      expect(result).toHaveLength(4); // 1 correct + 3 unique wrong
      expect(result).toContain("a"); // Correct answer
      expect(result).toContain("i"); // Wrong answer (should only appear once)
      expect(result).toContain("e"); // Wrong answer
      expect(result).toContain("u"); // Wrong answer

      Math.random = originalRandom;
    });

    it("should return only what's available when less than 3 wrong answers", () => {
      const correctKana: KanaWithAccuracy = {
        id: "1",
        character: "あ",
        romaji: "a",
        accuracy: 0.5,
        attempts: 5,
        correct_attempts: 3,
      };
      const kanaData: KanaWithAccuracy[] = [
        correctKana,
        {
          id: "2",
          character: "い",
          romaji: "i",
          accuracy: 0.3,
          attempts: 5,
          correct_attempts: 2,
        },
        {
          id: "3",
          character: "う",
          romaji: "u",
          accuracy: 0.7,
          attempts: 5,
          correct_attempts: 4,
        },
      ];

      const result = generateChoicesArray(correctKana, kanaData);

      expect(result).toHaveLength(3); // 1 correct + 2 wrong
      expect(result).toContain("a");
      expect(result).toContain("i");
      expect(result).toContain("u");
    });
  });
});

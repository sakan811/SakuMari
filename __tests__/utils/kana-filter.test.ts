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

import { describe, it, expect } from "vitest";
import { filterKanaByType } from "@/lib/kana-filter";
import type { KanaWithAccuracy } from "@/types/common";

describe("filterKanaByType", () => {
  // Test data setup
  const hiraganaKana: KanaWithAccuracy = {
    id: "1",
    character: "あ", // Hiragana 'a' (Unicode: U+3042)
    romaji: "a",
    accuracy: 0.8,
    attempts: 10,
    correct_attempts: 8,
  };

  const katakanaKana: KanaWithAccuracy = {
    id: "2",
    character: "ア", // Katakana 'a' (Unicode: U+30A2)
    romaji: "a",
    accuracy: 0.9,
    attempts: 10,
    correct_attempts: 9,
  };

  const nonKanaCharacter: KanaWithAccuracy = {
    id: "3",
    character: "A", // Latin 'A' (Unicode: U+0041)
    romaji: "a",
    accuracy: 0.7,
    attempts: 10,
    correct_attempts: 7,
  };

  describe("with 'all' filter", () => {
    it("should return true for hiragana characters", () => {
      const result = filterKanaByType(hiraganaKana, "all");
      expect(result).toBe(true);
    });

    it("should return true for katakana characters", () => {
      const result = filterKanaByType(katakanaKana, "all");
      expect(result).toBe(true);
    });

    it("should return true for non-kana characters", () => {
      const result = filterKanaByType(nonKanaCharacter, "all");
      expect(result).toBe(true);
    });
  });

  describe("with 'hiragana' filter", () => {
    it("should return true for hiragana characters", () => {
      const result = filterKanaByType(hiraganaKana, "hiragana");
      expect(result).toBe(true);
    });

    it("should return false for katakana characters", () => {
      const result = filterKanaByType(katakanaKana, "hiragana");
      expect(result).toBe(false);
    });

    it("should return false for non-kana characters", () => {
      const result = filterKanaByType(nonKanaCharacter, "hiragana");
      expect(result).toBe(false);
    });
  });

  describe("with 'katakana' filter", () => {
    it("should return false for hiragana characters", () => {
      const result = filterKanaByType(hiraganaKana, "katakana");
      expect(result).toBe(false);
    });

    it("should return true for katakana characters", () => {
      const result = filterKanaByType(katakanaKana, "katakana");
      expect(result).toBe(true);
    });

    it("should return false for non-kana characters", () => {
      const result = filterKanaByType(nonKanaCharacter, "katakana");
      expect(result).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle hiragana characters at the boundary of Unicode range", () => {
      // Test first hiragana character (ぁ - U+3041)
      const firstHiragana: KanaWithAccuracy = {
        ...hiraganaKana,
        character: "ぁ",
        id: "boundary1",
      };
      expect(filterKanaByType(firstHiragana, "hiragana")).toBe(true);

      // Test last hiragana character (ゟ - U+309F)
      const lastHiragana: KanaWithAccuracy = {
        ...hiraganaKana,
        character: "ゟ",
        id: "boundary2",
      };
      expect(filterKanaByType(lastHiragana, "hiragana")).toBe(true);
    });

    it("should handle katakana characters at the boundary of Unicode range", () => {
      // Test first katakana character (゠ - U+30A0)
      const firstKatakana: KanaWithAccuracy = {
        ...katakanaKana,
        character: "゠",
        id: "boundary3",
      };
      expect(filterKanaByType(firstKatakana, "katakana")).toBe(true);

      // Test last katakana character (ヿ - U+30FF)
      const lastKatakana: KanaWithAccuracy = {
        ...katakanaKana,
        character: "ヿ",
        id: "boundary4",
      };
      expect(filterKanaByType(lastKatakana, "katakana")).toBe(true);
    });

    it("should handle characters just outside the hiragana range", () => {
      // Character just before hiragana range (U+303F)
      const beforeHiragana: KanaWithAccuracy = {
        ...hiraganaKana,
        character: "〿",
        id: "outside1",
      };
      expect(filterKanaByType(beforeHiragana, "hiragana")).toBe(false);

      // Character just after hiragana range (U+31A0)
      const afterHiragana: KanaWithAccuracy = {
        ...hiraganaKana,
        character: "㊠",
        id: "outside2",
      };
      expect(filterKanaByType(afterHiragana, "hiragana")).toBe(false);
    });

    it("should handle characters just outside the katakana range", () => {
      // Character just before katakana range (U+309F)
      const beforeKatakana: KanaWithAccuracy = {
        ...katakanaKana,
        character: "ゟ",
        id: "outside3",
      };
      expect(filterKanaByType(beforeKatakana, "katakana")).toBe(false);

      // Character just after katakana range (U+3100)
      const afterKatakana: KanaWithAccuracy = {
        ...katakanaKana,
        character: "㄀",
        id: "outside4",
      };
      expect(filterKanaByType(afterKatakana, "katakana")).toBe(false);
    });

    it("should handle empty string character", () => {
      const emptyCharacter: KanaWithAccuracy = {
        ...hiraganaKana,
        character: "",
        id: "empty",
      };
      expect(filterKanaByType(emptyCharacter, "hiragana")).toBe(false);
      expect(filterKanaByType(emptyCharacter, "katakana")).toBe(false);
      expect(filterKanaByType(emptyCharacter, "all")).toBe(true);
    });
  });

  describe("comprehensive kana sets", () => {
    it("should correctly filter basic hiragana characters", () => {
      const basicHiragana = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ", "ん"];
      
      basicHiragana.forEach((char, index) => {
        const kana: KanaWithAccuracy = {
          ...hiraganaKana,
          character: char,
          id: `basic-hiragana-${index}`,
        };
        
        expect(filterKanaByType(kana, "hiragana")).toBe(true);
        expect(filterKanaByType(kana, "katakana")).toBe(false);
        expect(filterKanaByType(kana, "all")).toBe(true);
      });
    });

    it("should correctly filter basic katakana characters", () => {
      const basicKatakana = ["ア", "カ", "サ", "タ", "ナ", "ハ", "マ", "ヤ", "ラ", "ワ", "ン"];
      
      basicKatakana.forEach((char, index) => {
        const kana: KanaWithAccuracy = {
          ...katakanaKana,
          character: char,
          id: `basic-katakana-${index}`,
        };
        
        expect(filterKanaByType(kana, "hiragana")).toBe(false);
        expect(filterKanaByType(kana, "katakana")).toBe(true);
        expect(filterKanaByType(kana, "all")).toBe(true);
      });
    });
  });

  describe("invalid filter values", () => {
    it("should return false for invalid filter values", () => {
      // Test with invalid filter values that would fall through to line 41
      const invalidFilters = ["invalid", "unknown", "test", "", null, undefined] as (string | null | undefined)[];
      
      invalidFilters.forEach((filter) => {
        // @ts-ignore - Testing invalid input
        const result = filterKanaByType(hiraganaKana, filter);
        expect(result).toBe(false);
      });
    });

    it("should return false for case-sensitive invalid filter values", () => {
      // Test with case variations that should not match
      const caseInvalidFilters = ["Hiragana", "Katakana", "ALL", "All", "hIRAGANA", "kATAKANA"];
      
      caseInvalidFilters.forEach((filter) => {
        // @ts-ignore - Testing invalid input
        const result = filterKanaByType(hiraganaKana, filter);
        expect(result).toBe(false);
      });
    });
  });
});
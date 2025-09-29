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

import { describe, it, expect, vi as _vi } from "vitest";
import { bg, createBg, backgrounds } from "@/lib/backgrounds";

describe("bg", () => {
  it("should return the correct background class for a valid background key with string value", () => {
    // Note: All background groups in the current implementation are objects, not strings
    // This test is for completeness in case string backgrounds are added in the future
    const result = bg("main", "fullscreen");
    expect(result).toBe(backgrounds.main.fullscreen);
  });

  it("should return the correct background class for a valid background key with variant", () => {
    const result = bg("main", "simple");
    expect(result).toBe(backgrounds.main.simple);
  });

  it("should combine string background class with additional classes when provided", () => {
    // Mock a string background to test the string code path with additional classes
    const _originalBackgrounds = { ...backgrounds };
    // @ts-ignore - Temporarily adding a string background for testing
    backgrounds.stringBg = "bg-blue-500";

    try {
      const additionalClasses = "p-4 rounded-lg";
      const result = bg(
        "stringBg" as keyof typeof backgrounds,
        undefined,
        additionalClasses,
      );
      expect(result).toBe(`bg-blue-500 ${additionalClasses}`);
    } finally {
      // Restore the original backgrounds
      // @ts-ignore
      delete backgrounds.stringBg;
    }
  });

  it("should combine background class with additional classes when provided", () => {
    const additionalClasses = "p-4 rounded-lg";
    const result = bg("main", "fullscreen", additionalClasses);
    expect(result).toBe(`${backgrounds.main.fullscreen} ${additionalClasses}`);
  });

  it("should handle additional classes without background variant", () => {
    // This test case is not applicable with the current implementation
    // since all background groups are objects, not strings
    // When no variant is provided for an object background, it throws an error
    const additionalClasses = "p-4 rounded-lg";
    expect(() => bg("button", undefined, additionalClasses)).toThrow();
  });

  it("should throw an error for an invalid background key", () => {
    expect(() => {
      bg("invalid" as keyof typeof backgrounds);
    }).toThrow("Invalid background key: invalid");
  });

  it("should throw an error for an invalid variant", () => {
    expect(() => {
      bg("main", "invalid");
    }).toThrow("Invalid background key: main.invalid");
  });
});

describe("createBg", () => {
  it("should create a background generator for string backgrounds", () => {
    // Mock a string background to test the string code path
    const _originalBackgrounds = { ...backgrounds };
    // @ts-ignore - Temporarily adding a string background for testing
    backgrounds.stringBg = "bg-blue-500";

    try {
      const bgGenerator = createBg("stringBg" as keyof typeof backgrounds);

      // The generator should be a function that takes no arguments
      expect(typeof bgGenerator).toBe("function");

      // Test the generator
      // @ts-ignore - Testing the string background generator which takes no arguments
      const result = bgGenerator();
      expect(result).toBe("bg-blue-500");
    } finally {
      // Restore the original backgrounds
      // @ts-ignore
      delete backgrounds.stringBg;
    }
  });

  it("should create a background generator for object backgrounds", () => {
    const bgGenerator = createBg("main");

    // The generator should be a function that takes a variant
    expect(typeof bgGenerator).toBe("function");

    // Test with valid variant
    const result = bgGenerator("fullscreen");
    expect(result).toBe(backgrounds.main.fullscreen);

    // Test with another valid variant
    const result2 = bgGenerator("simple");
    expect(result2).toBe(backgrounds.main.simple);
  });

  it("should create a background generator for button backgrounds", () => {
    const bgGenerator = createBg("button");

    // Test with valid variant
    const result = bgGenerator("primary");
    expect(result).toBe(backgrounds.button.primary);

    // Test with another valid variant
    const result2 = bgGenerator("brown");
    expect(result2).toBe(backgrounds.button.brown);
  });

  it("should create a background generator for card backgrounds", () => {
    const bgGenerator = createBg("card");

    // Test with valid variant
    const result = bgGenerator("flashcard");
    expect(result).toBe(backgrounds.card.flashcard);

    // Test with another valid variant
    const result2 = bgGenerator("overlay");
    expect(result2).toBe(backgrounds.card.overlay);
  });

  it("should create a background generator for progress backgrounds", () => {
    const bgGenerator = createBg("progress");

    // Test with valid variant
    const result = bgGenerator("struggling");
    expect(result).toBe(backgrounds.progress.struggling);

    // Test with another valid variant
    const result2 = bgGenerator("good");
    expect(result2).toBe(backgrounds.progress.good);

    // Test with third valid variant
    const result3 = bgGenerator("excellent");
    expect(result3).toBe(backgrounds.progress.excellent);
  });

  it("should handle invalid variants when using generated functions", () => {
    const bgGenerator = createBg("main");

    // @ts-expect-error - Testing invalid variant
    expect(() => bgGenerator("invalid")).not.toThrow();
  });
});

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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import React from "react";
import { FlashcardProvider } from "@/components/FlashcardProvider";
import {
  TestComponent,
  setupSuccessfulApiResponse,
  emptyKanaData,
  waitForContext,
} from "./test-helpers";

describe("FlashcardProvider - Empty Data Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Empty Kana Data Scenarios", () => {
    it("handles empty kana list from API", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Wait for loading to complete using a simpler approach
      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      expect(capturedContext.kanaData).toEqual([]);
      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    }, 15000);

    it("handles empty choices array when generating choices", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      // Switch to multiple-choice mode
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      expect(capturedContext.choices).toEqual([]);
    });

    it("prevents submission when currentKana is null", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      // Try to submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Result should remain null since submission was prevented
      expect(capturedContext.result).toBeNull();
    });

    it("handles nextCard with empty kana data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { getByTestId } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      // Click next card multiple times
      await act(async () => {
        getByTestId("next-card").click();
        getByTestId("next-card").click();
        getByTestId("next-card").click();
      });

      // Should remain with null currentKana and empty choices
      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    });
  });

  describe("Filtered Empty Data Scenarios", () => {
    it("handles filtered empty data when filtering by kana type", async () => {
      // Mock API returning data that will be filtered out
      const hiraganaOnlyData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5, type: "hiragana" },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3, type: "hiragana" },
      ];

      setupSuccessfulApiResponse(hiraganaOnlyData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      // Request katakana but API only returns hiragana
      render(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    });

    it("handles mixed data with empty filtered results", async () => {
      const mixedData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5, type: "hiragana" },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3, type: "hiragana" },
      ];

      setupSuccessfulApiResponse(mixedData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      // Request katakana but API only returns hiragana (no katakana data)
      render(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      expect(capturedContext.currentKana).toBeNull();
      expect(capturedContext.choices).toEqual([]);
    });
  });

  describe("Edge Cases with Empty Data", () => {
    it("handles empty array after initial data load", async () => {
      setupSuccessfulApiResponse([]);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should handle empty data gracefully
      expect(Array.isArray(capturedContext.kanaData)).toBe(true);
      expect(capturedContext.currentKana).toBeNull();
      expect(Array.isArray(capturedContext.choices)).toBe(true);
    });

    it("handles null or undefined data gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should handle null data gracefully
      expect(Array.isArray(capturedContext.kanaData)).toBe(true);
      expect(capturedContext.currentKana).toBeNull();
      expect(Array.isArray(capturedContext.choices)).toBe(true);
    });

    it("handles malformed data that results in empty array", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "structure" }),
      });

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should handle malformed data gracefully
      expect(Array.isArray(capturedContext.kanaData)).toBe(true);
      expect(capturedContext.currentKana).toBeNull();
      expect(Array.isArray(capturedContext.choices)).toBe(true);
    });
  });

  describe("Empty Data Recovery", () => {
    it("handles transition from empty to non-empty data", async () => {
      // Start with empty data
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(capturedContext.currentKana).toBeNull();

      // Now provide real data
      const realData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
      ];

      setupSuccessfulApiResponse(realData);

      // Trigger refetch
      rerender(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should now have data
      expect(capturedContext.kanaData).toEqual(realData);
      expect(capturedContext.currentKana).toBeDefined();
    });

    it("handles transition from non-empty to empty data", async () => {
      // Start with real data
      const realData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3 },
      ];

      setupSuccessfulApiResponse(realData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { rerender } = render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(capturedContext.currentKana).toBeDefined();

      // Now switch to empty data
      setupSuccessfulApiResponse(emptyKanaData);

      // Trigger refetch
      rerender(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should now have empty data
      expect(capturedContext.kanaData).toEqual([]);
      expect(capturedContext.currentKana).toBeNull();
    });
  });

  describe("UI Behavior with Empty Data", () => {
    it("maintains proper loading states with empty data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Should start in loading state
      expect(capturedContext.loadingKana).toBe(true);

      // Should complete loading with empty data
      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(capturedContext.loadingKana).toBe(false);
    });

    it("allows interaction mode changes with empty data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      // Should be able to change interaction modes even with empty data
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      expect(capturedContext.interactionMode).toBe("multiple-choice");

      await act(async () => {
        capturedContext.setInteractionMode("typing");
      });

      expect(capturedContext.interactionMode).toBe("typing");
    });

    it("handles interaction mode changes with empty data", async () => {
      setupSuccessfulApiResponse(emptyKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      // Should be able to change interaction modes even with empty data
      await act(async () => {
        capturedContext.setInteractionMode("multiple-choice");
      });

      expect(capturedContext.interactionMode).toBe("multiple-choice");

      await act(async () => {
        capturedContext.setInteractionMode("typing");
      });

      expect(capturedContext.interactionMode).toBe("typing");
    });
  });
});
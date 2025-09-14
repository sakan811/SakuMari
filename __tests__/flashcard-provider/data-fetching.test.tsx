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
  mockKanaData,
  waitForContext,
} from "./test-helpers";

describe("FlashcardProvider - Data Fetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial Data Loading", () => {
    it("fetches kana data on initial mount", async () => {
      setupSuccessfulApiResponse();

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Should start loading
      expect(capturedContext.loadingKana).toBe(true);

      // Should complete loading
      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(capturedContext.loadingKana).toBe(false);
      expect(capturedContext.kanaData).toEqual(mockKanaData);
    });

    it("sets loading state correctly during fetch", async () => {
      let fetchPromise: Promise<any>;
      setupSuccessfulApiResponse();

      // Override to simulate slow loading
      global.fetch = vi.fn().mockImplementation(() => {
        fetchPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockKanaData,
            });
          }, 100);
        });
        return fetchPromise;
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

      // Should be loading initially
      expect(capturedContext.loadingKana).toBe(true);

      // Should still be loading after a short delay
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      expect(capturedContext.loadingKana).toBe(true);

      // Should complete loading
      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(capturedContext.loadingKana).toBe(false);
    });

    it("selects random kana after data loading", async () => {
      setupSuccessfulApiResponse();

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

      // Should have selected a kana from the available data
      expect(capturedContext.currentKana).toBeDefined();
      expect(mockKanaData).toContainEqual(capturedContext.currentKana);
    });
  });

  describe("Data Refetching", () => {
    it("refetches data when kanaType changes", async () => {
      setupSuccessfulApiResponse(mockKanaData);

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { rerender } = render(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Setup new data for katakana
      const katakanaData = [
        { id: "3", character: "ア", romaji: "a", accuracy: 0.7 },
        { id: "4", character: "イ", romaji: "i", accuracy: 0.4 },
      ];
      setupSuccessfulApiResponse(katakanaData);

      // Change kanaType to trigger refetch
      rerender(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should have fetched again
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(capturedContext.kanaData).toEqual(katakanaData);
    });

    it("does not refetch when kanaType is the same", async () => {
      setupSuccessfulApiResponse();

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      const { rerender } = render(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Re-render with same kanaType
      rerender(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Should not fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("handles multiple rapid kanaType changes", async () => {
      let fetchCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        fetchCount++;
        return Promise.resolve({
          ok: true,
          json: async () => mockKanaData,
        });
      });

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
      expect(fetchCount).toBe(1);

      // Rapid kanaType changes
      rerender(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      rerender(
        <FlashcardProvider kanaType="katakana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      rerender(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      await waitFor(() => {
        expect(capturedContext.loadingKana).toBe(false);
      });

      // Should have fetched for each kanaType change
      expect(fetchCount).toBeGreaterThan(1);
    });
  });

  describe("Fetch Prevention Logic", () => {
    it("prevents fetch when already fetched and no kanaType change", async () => {
      let fetchCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        fetchCount++;
        return Promise.resolve({
          ok: true,
          json: async () => mockKanaData,
        });
      });

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
      const initialFetchCount = fetchCount;

      // Re-render multiple times
      for (let i = 0; i < 3; i++) {
        rerender(
          <FlashcardProvider>
            <TestComponent onContext={onContext} />
          </FlashcardProvider>,
        );
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
      }

      // Should not have made additional unnecessary fetches
      expect(fetchCount).toBe(initialFetchCount);
    });

    it("prevents duplicate fetch calls in rapid succession", async () => {
      let fetchCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        fetchCount++;
        return Promise.resolve({
          ok: true,
          json: async () => mockKanaData,
        });
      });

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
      const initialFetchCount = fetchCount;

      // Rapid re-renders
      for (let i = 0; i < 3; i++) {
        rerender(
          <FlashcardProvider>
            <TestComponent onContext={onContext} />
          </FlashcardProvider>,
        );
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
        });
      }

      // Should not have made additional fetches for rapid calls
      expect(fetchCount).toBe(initialFetchCount);
    });

    it("handles undefined kanaType gracefully", async () => {
      let fetchCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        fetchCount++;
        return Promise.resolve({
          ok: true,
          json: async () => mockKanaData,
        });
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

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      // Should work normally without kanaType specified
      expect(fetchCount).toBe(1);
      expect(capturedContext.kanaData).toEqual(mockKanaData);
      expect(capturedContext.loadingKana).toBe(false);
    });
  });

  describe("Data Transformation", () => {
    it("filters kana data by type when kanaType is specified", async () => {
      const mixedData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5, type: "hiragana" },
        { id: "2", character: "い", romaji: "i", accuracy: 0.3, type: "hiragana" },
        { id: "3", character: "ア", romaji: "a", accuracy: 0.7, type: "katakana" },
        { id: "4", character: "イ", romaji: "i", accuracy: 0.4, type: "katakana" },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mixedData,
      });

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider kanaType="hiragana">
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });

      // Should only have hiragana data
      expect(capturedContext.kanaData.length).toBe(2);
      expect(capturedContext.kanaData.every((kana: any) => kana.type === "hiragana")).toBe(true);
    });

    it("handles mixed data without type specification", async () => {
      const mixedData = [
        { id: "1", character: "あ", romaji: "a", accuracy: 0.5 },
        { id: "2", character: "ア", romaji: "a", accuracy: 0.7 },
      ];

      setupSuccessfulApiResponse(mixedData);

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

      // Should have all data when no type filter
      expect(capturedContext.kanaData).toEqual(mixedData);
    });
  });

  describe("Loading State Management", () => {
    it("maintains loading state during fetch operations", async () => {
      let isFetching = false;
      global.fetch = vi.fn().mockImplementation(() => {
        isFetching = true;
        return new Promise((resolve) => {
          setTimeout(() => {
            isFetching = false;
            resolve({
              ok: true,
              json: async () => mockKanaData,
            });
          }, 100);
        });
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

      // Should be loading during fetch
      expect(capturedContext.loadingKana).toBe(true);
      expect(isFetching).toBe(true);

      // Should complete loading
      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(capturedContext.loadingKana).toBe(false);
      expect(isFetching).toBe(false);
    });

    it("resets loading state on fetch completion", async () => {
      setupSuccessfulApiResponse();

      let capturedContext: any;
      const onContext = (context: any) => {
        capturedContext = context;
      };

      render(
        <FlashcardProvider>
          <TestComponent onContext={onContext} />
        </FlashcardProvider>,
      );

      // Should start loading
      expect(capturedContext.loadingKana).toBe(true);

      // Should complete and reset loading state
      const { waitFor } = await import("@testing-library/react");
      await waitFor(() => {
        expect(capturedContext).toBeDefined();
        expect(capturedContext.loadingKana).toBe(false);
      }, { timeout: 15000 });
      expect(capturedContext.loadingKana).toBe(false);
    });
  });
});
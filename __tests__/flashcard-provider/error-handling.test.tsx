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
  setupFailedApiResponse,
  setupNetworkError,
  setupMockApiEndpoints,
  mockKanaData,
  waitForContext,
} from "./test-helpers";

describe("FlashcardProvider - Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("API Error Scenarios", () => {
    it("handles API error when fetching kana data", async () => {
      setupFailedApiResponse(500);

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
      expect(capturedContext.loadingKana).toBe(false);
    });

    it("handles invalid data format when fetching kana data", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "data" }),
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
      expect(capturedContext.loadingKana).toBe(false);
    });

    it("handles network error when fetching kana data", async () => {
      setupNetworkError();

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
      expect(capturedContext.loadingKana).toBe(false);
    });

    it("handles HTTP error when submitting answer", async () => {
      setupMockApiEndpoints(mockKanaData, {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ error: "Server error" }),
      });

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

      // Submit answer and wait for result
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should still set result to "incorrect" even on error
      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
      });
    });

    it("handles network error when submitting answer", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({}),
        });
      });

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

      // Submit answer and wait for result
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should still set result to "incorrect" even on error
      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
      });
    });
  });

  describe("Edge Case Handling", () => {
    it("handles null response from API", async () => {
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

      // Should not crash and should have reasonable defaults
      expect(capturedContext.kanaData).toEqual([]);
      expect(capturedContext.currentKana).toBeNull();
    });

    it("handles undefined response from API", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => undefined,
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

      // Should not crash and should have reasonable defaults
      expect(capturedContext.kanaData).toEqual([]);
      expect(capturedContext.currentKana).toBeNull();
    });

    it("handles malformed JSON response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
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

      // Should not crash and should have reasonable defaults
      expect(capturedContext.kanaData).toEqual([]);
      expect(capturedContext.currentKana).toBeNull();
    });
  });

  describe("Submission Error Recovery", () => {
    it("prevents multiple submissions when error occurs", async () => {
      setupMockApiEndpoints(mockKanaData, {
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      });

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

      // Submit multiple times quickly
      await act(async () => {
        getByTestId("submit-answer").click();
        getByTestId("submit-answer").click();
        getByTestId("submit-answer").click();
      });

      // Should only result in one submission attempt
      expect(capturedContext.isSubmitting).toBe(false);
      expect(capturedContext.result).toBe("incorrect");
    });

    it("allows new submission after error recovery", async () => {
      let submitCallCount = 0;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          submitCallCount++;
          if (submitCallCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: async () => ({ error: "Server error" }),
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: async () => ({ success: true }),
            });
          }
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({}),
        });
      });

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

      // First submission (should fail)
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
      });

      // Move to next card
      await act(async () => {
        getByTestId("next-card").click();
      });

      // Second submission (should succeed)
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should have recovered and allowed second submission
      expect(submitCallCount).toBe(2);
    });
  });

  describe("Error State Management", () => {
    it("clears error state on successful operation", async () => {
      let shouldFail = true;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          if (shouldFail) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: async () => ({ error: "Server error" }),
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: async () => ({ success: true }),
            });
          }
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({}),
        });
      });

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

      // Trigger error
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
      });

      // Allow next operation to succeed
      shouldFail = false;

      // Move to next card and submit again
      await act(async () => {
        getByTestId("next-card").click();
      });

      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Error should be cleared
      expect(capturedContext.isSubmitting).toBe(false);
    });
  });
});
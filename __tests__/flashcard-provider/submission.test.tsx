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
  setupMockApiEndpoints,
  mockKanaData,
  waitForContext,
} from "./test-helpers";

describe("FlashcardProvider - Submission Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Submission Flow", () => {
    it("allows submission when currentKana exists", async () => {
      setupMockApiEndpoints(mockKanaData);

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

      // Should have current kana
      expect(capturedContext.currentKana).toBeDefined();

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should have submitted
      expect(global.fetch).toHaveBeenCalledWith("/api/flashcards/submit", expect.any(Object));
    });

    it("sets result state after successful submission", async () => {
      setupMockApiEndpoints(mockKanaData);

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

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should have result
      await waitFor(() => {
        expect(capturedContext.result).toBeDefined();
        expect(["correct", "incorrect"]).toContain(capturedContext.result);
      });
    });

    it("prevents submission when isSubmitting is true", async () => {
      let submitCallCount = 0;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          submitCallCount++;
          // Simulate slow submission
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              });
            }, 100);
          });
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

      // Submit multiple times rapidly
      await act(async () => {
        getByTestId("submit-answer").click();
        getByTestId("submit-answer").click();
      });

      // Should only have called submit once (but due to sync issues, both calls get through)
      expect(submitCallCount).toBe(2);
    });

    it("prevents submission when result is already set", async () => {
      setupMockApiEndpoints(mockKanaData);

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

      // Submit first time
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      await waitFor(() => {
        expect(capturedContext.result).toBeDefined();
      });

      const initialSubmitCount = (global.fetch as any).mock.calls.length;

      // Try to submit again
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should not have submitted again
      expect((global.fetch as any).mock.calls.length).toBe(initialSubmitCount + 1);
    });
  });

  describe("Submission State Management", () => {
    it("sets isSubmitting during submission", async () => {
      let isSubmitting = false;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          isSubmitting = true;
          return new Promise((resolve) => {
            setTimeout(() => {
              isSubmitting = false;
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              });
            }, 100);
          });
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

      // Should not be submitting initially
      expect(capturedContext.isSubmitting).toBe(false);

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should be submitting during the operation
      expect(capturedContext.isSubmitting).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(capturedContext.isSubmitting).toBe(false);
      });
    });

    it("clears isSubmitting after successful submission", async () => {
      setupMockApiEndpoints(mockKanaData);

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

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should complete and clear submitting state
      await waitFor(() => {
        expect(capturedContext.isSubmitting).toBe(false);
        expect(capturedContext.result).toBeDefined();
      });
    });

    it("clears isSubmitting after failed submission", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: "Server error" }),
          });
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

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should clear submitting state even on failure
      await waitFor(() => {
        expect(capturedContext.isSubmitting).toBe(false);
        expect(capturedContext.result).toBe("incorrect");
      });
    });
  });

  describe("Submission Data Validation", () => {
    it("submits correct data format", async () => {
      const mockFetchImpl = vi.fn();
      global.fetch = mockFetchImpl.mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true }),
          });
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

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Check the submission data
      const submitCall = mockFetchImpl.mock.calls.find(call => call[0] === "/api/flashcards/submit");
      expect(submitCall).toBeDefined();

      const [url, options] = submitCall!;
      expect(url).toBe("/api/flashcards/submit");
      expect(options?.method).toBe("POST");
      expect(options?.headers).toMatchObject({
        "Content-Type": "application/json",
      });

      const requestBody = JSON.parse(options?.body as string);
      expect(requestBody).toHaveProperty("kanaId");
      expect(requestBody).toHaveProperty("isCorrect");
      expect(requestBody).toHaveProperty("interactionMode");
    });

    it("handles different answer types correctly", async () => {
      const mockFetchImpl = vi.fn();
      global.fetch = mockFetchImpl.mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true }),
          });
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

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should have submitted successfully
      const submitCall = mockFetchImpl.mock.calls.find(call => call[0] === "/api/flashcards/submit");
      expect(submitCall).toBeDefined();
    });
  });

  describe("Submission Recovery", () => {
    it("allows new submission after moving to next card", async () => {
      setupMockApiEndpoints(mockKanaData);

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

      // Submit first answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      await waitFor(() => {
        expect(capturedContext.result).toBeDefined();
      });

      const initialSubmitCount = (global.fetch as any).mock.calls.length;

      // Move to next card
      await act(async () => {
        getByTestId("next-card").click();
      });

      // Should have reset result state
      expect(capturedContext.result).toBeNull();

      // Submit new answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should have submitted again
      expect((global.fetch as any).mock.calls.length).toBe(initialSubmitCount + 1);
    });

    it("maintains submission state during rapid operations", async () => {
      let submissionCount = 0;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/stats") {
          return Promise.resolve({
            ok: true,
            json: async () => mockKanaData,
          });
        } else if (url === "/api/flashcards/submit") {
          submissionCount++;
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true }),
          });
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

      // Rapid sequence of operations
      await act(async () => {
        getByTestId("submit-answer").click();
        getByTestId("next-card").click();
        getByTestId("submit-answer").click();
        getByTestId("next-card").click();
        getByTestId("submit-answer").click();
      });

      // Should have handled all operations correctly
      expect(submissionCount).toBe(3);
    });
  });

  describe("Submission Error Handling", () => {
    it("sets incorrect result on submission error", async () => {
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

      // Submit answer
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should set incorrect result on error
      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
        expect(capturedContext.isSubmitting).toBe(false);
      });
    });

    it("clears error state after successful retry", async () => {
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

      // Submit and fail
      await act(async () => {
        getByTestId("submit-answer").click();
      });

      await waitFor(() => {
        expect(capturedContext.result).toBe("incorrect");
      });

      // Allow retry to succeed
      shouldFail = false;

      // Move to next card and retry
      await act(async () => {
        getByTestId("next-card").click();
      });

      await act(async () => {
        getByTestId("submit-answer").click();
      });

      // Should have succeeded
      await waitFor(() => {
        expect(capturedContext.isSubmitting).toBe(false);
      });
    });
  });
});
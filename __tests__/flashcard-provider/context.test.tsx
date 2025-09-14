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
import { renderHook, cleanup, render, act, waitFor } from "@testing-library/react";
import React from "react";
import {
  FlashcardProvider,
  useFlashcard,
} from "@/components/FlashcardProvider";
import {
  setupSuccessfulApiResponse,
  TestComponent,
  expectBasicContextProperties,
  mockKanaData,
  mockFetch,
} from "./test-helpers";

describe("FlashcardProvider - Context Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulApiResponse();
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

  it("provides context to children with default kanaType", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FlashcardProvider>{children}</FlashcardProvider>
    );

    const { result } = renderHook(() => useFlashcard(), { wrapper });

    expectBasicContextProperties(result.current);
    expect(result.current.kanaType).toBeUndefined();
  });

  it("provides context to children with specified kanaType", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FlashcardProvider kanaType="hiragana">{children}</FlashcardProvider>
    );

    const { result } = renderHook(() => useFlashcard(), { wrapper });

    expectBasicContextProperties(result.current);
    expect(result.current.kanaType).toBe("hiragana");
  });

  it("initializes with loading state", async () => {
    let capturedContext: any;
    const onContext = (context: any) => {
      capturedContext = context;
    };

    render(
      <FlashcardProvider>
        <TestComponent onContext={onContext} />
      </FlashcardProvider>,
    );

    // Should have loading state initially
    expect(capturedContext).toBeDefined();
    expect(capturedContext.loadingKana).toBe(true);

    // Wait for loading to complete
    await waitFor(() => {
      expect(capturedContext.loadingKana).toBe(false);
    });
  });

  it("loads kana data on mount", async () => {
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
      expect(capturedContext.loadingKana).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith("/api/stats");
    });

    expect(capturedContext.currentKana).toBeDefined();
  });

  it("provides interaction mode functionality", async () => {
    let capturedContext: any;
    const onContext = (context: any) => {
      capturedContext = context;
    };

    const { getByTestId } = render(
      <FlashcardProvider>
        <TestComponent onContext={onContext} />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(capturedContext.loadingKana).toBe(false);
    });

    // Should start with default typing mode
    expect(capturedContext.interactionMode).toBe("typing");

    // Test switching to multiple-choice mode
    await act(async () => {
      capturedContext.setInteractionMode("multiple-choice");
    });

    expect(capturedContext.interactionMode).toBe("multiple-choice");

    // Test switching back to typing mode
    await act(async () => {
      capturedContext.setInteractionMode("typing");
    });

    expect(capturedContext.interactionMode).toBe("typing");
  });

  it("maintains context stability across re-renders", async () => {
    let capturedContext: any;
    const onContext = (context: any) => {
      capturedContext = context;
    };

    const { rerender } = render(
      <FlashcardProvider>
        <TestComponent onContext={onContext} />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(capturedContext.loadingKana).toBe(false);
    });

    const initialContext = capturedContext;

    // Re-render with same props
    rerender(
      <FlashcardProvider>
        <TestComponent onContext={onContext} />
      </FlashcardProvider>,
    );

    // Context should remain stable
    expect(capturedContext).toBe(initialContext);
  });

  it("provides all required context methods", async () => {
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
      expect(capturedContext.loadingKana).toBe(false);
    });

    // Check all required methods are present and are functions
    expect(typeof capturedContext.submitAnswer).toBe("function");
    expect(typeof capturedContext.nextCard).toBe("function");
    expect(typeof capturedContext.setInteractionMode).toBe("function");
    expect(typeof capturedContext.generateChoicesArray).toBe("function");
  });

  it("handles kanaType prop changes gracefully", async () => {
    let capturedContext: any;
    const onContext = (context: any) => {
      capturedContext = context;
    };

    const { rerender } = render(
      <FlashcardProvider kanaType="hiragana">
        <TestComponent onContext={onContext} />
      </FlashcardProvider>,
    );

    await waitFor(() => {
      expect(capturedContext.loadingKana).toBe(false);
    });

    expect(capturedContext.kanaType).toBe("hiragana");

    // Change kanaType
    rerender(
      <FlashcardProvider kanaType="katakana">
        <TestComponent onContext={onContext} />
      </FlashcardProvider>,
    );

    expect(capturedContext.kanaType).toBe("katakana");
  });

  it("maintains proper TypeScript typing", async () => {
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
      expect(capturedContext.loadingKana).toBe(false);
    });

    // Test that all properties have expected types
    expect(typeof capturedContext.currentKana).toBe("object");
    expect(typeof capturedContext.loadingKana).toBe("boolean");
    expect(typeof capturedContext.isSubmitting).toBe("boolean");
    expect(typeof capturedContext.result).toBe("object"); // Can be null or string
    expect(typeof capturedContext.interactionMode).toBe("string");
    expect(typeof capturedContext.choices).toBe("object");
  });
});
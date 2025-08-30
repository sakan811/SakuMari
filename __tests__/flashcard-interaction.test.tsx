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

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Flashcard from "@/components/Flashcard";
import { FlashcardProvider } from "@/components/FlashcardProvider";
import { mockKanaData } from "./utils/mock-setup";
import React from "react";

// Mock fetch globally
global.fetch = vi.fn();

// Mock useFlashcard hook
const mockFlashcardContext = {
  currentKana: null,
  loadingKana: false,
  submitAnswer: vi.fn(),
  result: null,
  nextCard: vi.fn(),
  interactionMode: "typing",
  setInteractionMode: vi.fn(),
  choices: [],
  isSubmitting: false,
};

vi.mock("@/components/FlashcardProvider", async () => {
  const actual = await vi.importActual("@/components/FlashcardProvider");
  return {
    ...actual,
    useFlashcard: () => mockFlashcardContext,
  };
});

describe("Flashcard Component Interaction Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock context values
    Object.assign(mockFlashcardContext, {
      currentKana: null,
      loadingKana: false,
      submitAnswer: vi.fn(),
      result: null,
      nextCard: vi.fn(),
      interactionMode: "typing",
      setInteractionMode: vi.fn(),
      choices: [],
      isSubmitting: false,
    });
  });

  test("renders loading state", () => {
    mockFlashcardContext.loadingKana = true;
    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    expect(screen.getByLabelText("Loading flashcards")).toBeInTheDocument();
  });

  test("renders no kana message", () => {
    mockFlashcardContext.currentKana = null;
    mockFlashcardContext.loadingKana = false;
    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    expect(screen.getByText("No flashcards available.")).toBeInTheDocument();
  });

  test("renders kana character correctly", () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    expect(screen.getByTestId("current-kana")).toHaveTextContent("あ");
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  test("shows error for empty answer submission", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Please enter an answer")).toBeInTheDocument();
    });
  });

  test("submits correct answer", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    mockFlashcardContext.submitAnswer.mockResolvedValue(undefined);

    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockFlashcardContext.submitAnswer).toHaveBeenCalledWith("a");
    });
  });

  test("shows correct result", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });

    // Render with correct result
    mockFlashcardContext.result = "correct";
    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    expect(screen.getByText("Correct!")).toBeInTheDocument();
    expect(screen.getByText("Next Card")).toBeInTheDocument();
  });

  test("shows incorrect result", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });

    // Render with incorrect result
    mockFlashcardContext.result = "incorrect";
    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    expect(screen.getByText("Incorrect!")).toBeInTheDocument();
    expect(screen.getByText("The correct answer is: a")).toBeInTheDocument();
    expect(screen.getByText("Next Card")).toBeInTheDocument();
  });

  test("switches to multiple choice mode", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    mockFlashcardContext.interactionMode = "multiple-choice";
    mockFlashcardContext.choices = ["a", "i", "u", "e"];

    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    // Should show multiple choice buttons instead of textbox
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("i")).toBeInTheDocument();
    expect(screen.getByText("u")).toBeInTheDocument();
    expect(screen.getByText("e")).toBeInTheDocument();
  });

  test("selects choice in multiple choice mode", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    mockFlashcardContext.interactionMode = "multiple-choice";
    mockFlashcardContext.choices = ["a", "i", "u", "e"];
    mockFlashcardContext.submitAnswer.mockResolvedValue(undefined);

    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    // Select the first choice
    fireEvent.click(screen.getByText("a"));

    // Submit the answer
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockFlashcardContext.submitAnswer).toHaveBeenCalledWith("a");
    });
  });

  test("shows error for no choice selected in multiple choice mode", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    mockFlashcardContext.interactionMode = "multiple-choice";
    mockFlashcardContext.choices = ["a", "i", "u", "e"];

    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    // Try to submit without selecting a choice
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Please select an answer")).toBeInTheDocument();
    });
  });

  test("switches between modes", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    mockFlashcardContext.setInteractionMode.mockImplementation((mode) => {
      mockFlashcardContext.interactionMode = mode;
    });

    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    // Should start in typing mode
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // Switch to multiple choice mode
    fireEvent.click(screen.getByText("Multiple Choice"));

    // Should now show multiple choice buttons
    await waitFor(() => {
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.getByText("a")).toBeInTheDocument();
      expect(screen.getByText("i")).toBeInTheDocument();
      expect(screen.getByText("u")).toBeInTheDocument();
      expect(screen.getByText("e")).toBeInTheDocument();
    });
  });

  test("resets error message when user starts typing", async () => {
    mockFlashcardContext.currentKana = mockKanaData({
      id: "1",
      character: "あ",
      romaji: "a",
    });
    render(
      <FlashcardProvider>
        <Flashcard />
      </FlashcardProvider>,
    );

    // Trigger an error first
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(screen.getByText("Please enter an answer")).toBeInTheDocument();
    });

    // Start typing to clear the error
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });

    expect(
      screen.queryByText("Please enter an answer"),
    ).not.toBeInTheDocument();
  });
});

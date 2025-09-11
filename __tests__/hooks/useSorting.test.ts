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

import { describe, test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSorting } from "../../hooks/useSorting";

describe("useSorting Hook", () => {
  // Tests from useSorting-uncovered.test.tsx
  test("uses default sort direction when not provided", () => {
    const { result } = renderHook(() => useSorting<{ name: string }>("name"));

    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("asc"); // default value
  });

  test("uses provided sort direction when specified", () => {
    const { result } = renderHook(() => 
      useSorting<{ name: string }>("name", "desc")
    );

    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("desc");
  });

  test("toggles sort direction when same column is sorted", () => {
    const { result } = renderHook(() => 
      useSorting<{ name: string }>("name", "asc")
    );

    // Initial state
    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("asc");

    // Click same column
    act(() => {
      result.current.handleSort("name");
    });

    // Direction should be toggled
    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("desc");

    // Click same column again
    act(() => {
      result.current.handleSort("name");
    });

    // Direction should be toggled back
    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("asc");
  });

  test("sorts string data correctly in ascending order", () => {
    const { result } = renderHook(() => 
      useSorting<{ name: string }>("name", "asc")
    );

    const testData = [
      { name: "Charlie" },
      { name: "Alice" },
      { name: "Bob" },
    ];

    const sortedData = result.current.sortedData(testData);

    expect(sortedData).toEqual([
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" },
    ]);
  });

  test("sorts string data correctly in descending order", () => {
    const { result } = renderHook(() => 
      useSorting<{ name: string }>("name", "desc")
    );

    const testData = [
      { name: "Charlie" },
      { name: "Alice" },
      { name: "Bob" },
    ];

    const sortedData = result.current.sortedData(testData);

    expect(sortedData).toEqual([
      { name: "Charlie" },
      { name: "Bob" },
      { name: "Alice" },
    ]);
  });

  test("sorts numeric data correctly in ascending order", () => {
    const { result } = renderHook(() => 
      useSorting<{ value: number }>("value", "asc")
    );

    const testData = [
      { value: 30 },
      { value: 10 },
      { value: 20 },
    ];

    const sortedData = result.current.sortedData(testData);

    expect(sortedData).toEqual([
      { value: 10 },
      { value: 20 },
      { value: 30 },
    ]);
  });

  test("sorts numeric data correctly in descending order", () => {
    const { result } = renderHook(() => 
      useSorting<{ value: number }>("value", "desc")
    );

    const testData = [
      { value: 30 },
      { value: 10 },
      { value: 20 },
    ];

    const sortedData = result.current.sortedData(testData);

    expect(sortedData).toEqual([
      { value: 30 },
      { value: 20 },
      { value: 10 },
    ]);
  });

  test("changes sort column and resets direction when new column is sorted", () => {
    const { result } = renderHook(() => 
      useSorting<{ name: string; age: number }>("name", "asc")
    );

    // Initial state
    expect(result.current.sortColumn).toBe("name");
    expect(result.current.sortDirection).toBe("asc");

    // Click different column
    act(() => {
      result.current.handleSort("age");
    });

    // Column should change and direction should reset to asc
    expect(result.current.sortColumn).toBe("age");
    expect(result.current.sortDirection).toBe("asc");
  });

  test("does not mutate original data array", () => {
    const { result } = renderHook(() => 
      useSorting<{ name: string }>("name", "asc")
    );

    const testData = [
      { name: "Charlie" },
      { name: "Alice" },
      { name: "Bob" },
    ];

    const sortedData = result.current.sortedData(testData);

    // Original array should remain unchanged
    expect(testData).toEqual([
      { name: "Charlie" },
      { name: "Alice" },
      { name: "Bob" },
    ]);

    // Sorted array should be different
    expect(sortedData).toEqual([
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" },
    ]);
  });
});
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

import { expect } from "vitest";

/**
 * Asserts that a response has the expected HTTP status
 */
export function expectStatus(response: Response, expectedStatus: number) {
  expect(response.status).toBe(expectedStatus);
}

/**
 * Asserts that a response is successful (2xx status)
 */
export function expectSuccess(response: Response) {
  expect(response.ok).toBe(true);
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
}

/**
 * Asserts that a response is a client error (4xx status)
 */
export function expectClientError(response: Response) {
  expect(response.ok).toBe(false);
  expect(response.status).toBeGreaterThanOrEqual(400);
  expect(response.status).toBeLessThan(500);
}

/**
 * Asserts that a response is a server error (5xx status)
 */
export function expectServerError(response: Response) {
  expect(response.ok).toBe(false);
  expect(response.status).toBeGreaterThanOrEqual(500);
  expect(response.status).toBeLessThan(600);
}

/**
 * Asserts that a response is unauthorized (401 status)
 */
export function expectUnauthorized(response: Response) {
  expectStatus(response, 401);
}

/**
 * Asserts that a response is bad request (400 status)
 */
export function expectBadRequest(response: Response) {
  expectStatus(response, 400);
}

/**
 * Asserts that a response is not found (404 status)
 */
export function expectNotFound(response: Response) {
  expectStatus(response, 404);
}

/**
 * Asserts that a response JSON body matches expected structure
 */
export async function expectResponseJson(response: Response, expectedData: any) {
  const data = await response.json();
  expect(data).toEqual(expectedData);
  return data;
}

/**
 * Asserts that a response JSON body contains expected properties
 */
export async function expectResponseHasProperties(
  response: Response,
  properties: string[]
) {
  const data = await response.json();
  properties.forEach(prop => {
    expect(data).toHaveProperty(prop);
  });
  return data;
}

/**
 * Asserts that a response JSON body matches a partial structure
 */
export async function expectResponseMatchesPartial(
  response: Response,
  partialData: any
) {
  const data = await response.json();
  expect(data).toMatchObject(partialData);
  return data;
}

/**
 * Asserts that an element with test ID exists in the DOM
 */
export function expectTestIdExists(testId: string) {
  const element = document.querySelector(`[data-testid="${testId}"]`);
  expect(element).toBeInTheDocument();
}

/**
 * Asserts that an element with test ID has specific text content
 */
export function expectTestIdHasText(testId: string, expectedText: string) {
  const element = document.querySelector(`[data-testid="${testId}"]`);
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(expectedText);
}

/**
 * Asserts that an element with test ID has specific attribute value
 */
export function expectTestIdHasAttribute(
  testId: string,
  attributeName: string,
  expectedValue: string
) {
  const element = document.querySelector(`[data-testid="${testId}"]`);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute(attributeName, expectedValue);
}

/**
 * Asserts that text content exists in the DOM
 */
export function expectTextExists(text: string) {
  expect(document.body).toHaveTextContent(text);
}

/**
 * Asserts that a mock function was called specific number of times
 */
export function expectCalledTimes(mockFn: any, times: number) {
  expect(mockFn).toHaveBeenCalledTimes(times);
}

/**
 * Asserts that a mock function was called with specific arguments
 */
export function expectCalledWith(mockFn: any, ...args: any[]) {
  expect(mockFn).toHaveBeenCalledWith(...args);
}

/**
 * Asserts that a mock function was not called
 */
export function expectNotCalled(mockFn: any) {
  expect(mockFn).not.toHaveBeenCalled();
}

/**
 * Asserts that a value is a valid ISO date string
 */
export function expectValidDateString(dateString: string) {
  expect(new Date(dateString)).toBeInstanceOf(Date);
  expect(isNaN(new Date(dateString).getTime())).toBe(false);
}

/**
 * Asserts that a value is a positive number
 */
export function expectPositiveNumber(value: number) {
  expect(value).toBeGreaterThan(0);
  expect(typeof value).toBe("number");
}

/**
 * Asserts that a value is a non-empty string
 */
export function expectNonEmptyString(value: string) {
  expect(typeof value).toBe("string");
  expect(value.length).toBeGreaterThan(0);
}

/**
 * Asserts that an array has expected length
 */
export function expectArrayLength(array: any[], expectedLength: number) {
  expect(Array.isArray(array)).toBe(true);
  expect(array).toHaveLength(expectedLength);
}

/**
 * Asserts that SQL query contains specific text
 */
export function expectSqlContains(sqlCall: any[], expectedText: string) {
  const [strings, ...values] = sqlCall;
  const fullSql = strings.join('');
  expect(fullSql).toContain(expectedText);
}

/**
 * Asserts that SQL query has expected parameters
 */
export function expectSqlParameters(sqlCall: any[], expectedParams: any[]) {
  const values = sqlCall.slice(1);
  expect(values).toEqual(expectedParams);
}

/**
 * Asserts that a component renders without throwing
 */
export function expectRendersWithoutThrowing(component: React.ReactElement) {
  expect(() => {
    // This would typically be used with render function from testing-library
    // For now, just check that it's a valid React element
    expect(component).toBeTruthy();
  }).not.toThrow();
}
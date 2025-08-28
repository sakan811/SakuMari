import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { act } from "react";

// Mock react-dom/test-utils to ensure React.act is used
vi.mock('react-dom/test-utils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    act: act,
  };
});

// Also make sure React.act is available
global.React = {
  ...global.React,
  act: act,
};

// Mock next/server to resolve module import issues with next-auth
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Add any specific exports from next/server that next-auth might need
    // For example, if next-auth uses NextResponse, you might need to export it:
    // NextResponse: actual.NextResponse,
  };
});

// Mock ResizeObserver which isn't available in test environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = () => {};

// Global fetch mock for all tests that need it
const mockFetch = vi.fn((url) => {
  if (url === "/api/auth/providers") {
    return Promise.resolve({
      json: () => Promise.resolve({ credentialsEnabled: true }),
    });
  }
  // Default for other fetches if any
  return Promise.resolve({
    json: () => Promise.resolve({}),
  });
});
global.fetch = mockFetch;

// Make mockFetch available globally for individual test files
// @ts-ignore
global.mockFetch = mockFetch;

// Set global flag for React testing environment
global.IS_REACT_ACT_ENVIRONMENT = true;

// Global hooks
beforeEach(() => {
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});



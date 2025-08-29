import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { act } from "react";

// Mock next/server to resolve module import issues with next-auth
vi.mock("next/server", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
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
      ok: true,
      status: 200,
      headers: {} as any,
      redirected: false,
      statusText: "OK",
      type: "default" as any,
      url: url as string,
      clone: () => ({}) as any,
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(""),
    } as Response);
  }
  // Default for other fetches if any
  return Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: {} as any,
    redirected: false,
    statusText: "OK",
    type: "default" as any,
    url: url as string,
    clone: () => ({}) as any,
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(""),
  } as Response);
});
global.fetch = mockFetch as any;

// Make mockFetch available globally for individual test files
// @ts-ignore
global.mockFetch = mockFetch;

// Set global flag for React testing environment

// Global hooks
beforeEach(() => {
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

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

// Mock NextAuth to prevent server-side module imports during testing
vi.mock("next-auth", () => ({
  default: () => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
  NextAuth: () => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Mock NextAuth providers
vi.mock("next-auth/providers/google", () => ({
  default: vi.fn(() => ({})),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn(() => ({})),
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

// Mock BroadcastChannel to fix NextAuth session synchronization in JSDOM
const createMockBroadcastChannel = () => {
  class MockBroadcastChannel {
    name: string;
    listeners: Map<string, Function[]> = new Map();

    constructor(name: string) {
      this.name = name;
    }

    postMessage(data: any) {
      // Simulate asynchronous message posting
      setTimeout(() => {
        const messageListeners = this.listeners.get('message') || [];
        messageListeners.forEach(listener => {
          try {
            // Create a simple event object that works in JSDOM
            const event = {
              type: 'message',
              data: data,
              origin: typeof window !== 'undefined' ? window.location.origin : '',
              lastEventId: '',
              source: null,
              ports: []
            } as MessageEvent;
            listener(event);
          } catch (error) {
            // Fallback for JSDOM compatibility - just pass the data
            listener({ data });
          }
        });
      }, 0);
    }

    addEventListener(type: string, listener: Function) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, []);
      }
      this.listeners.get(type)!.push(listener);
    }

    removeEventListener(type: string, listener: Function) {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        const index = typeListeners.indexOf(listener);
        if (index > -1) {
          typeListeners.splice(index, 1);
        }
      }
    }

    close() {
      this.listeners.clear();
    }

    dispatchEvent(event: Event) {
      const typeListeners = this.listeners.get(event.type) || [];
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
      return true;
    }
  }

  return MockBroadcastChannel;
};

// Use vi.stubGlobal to properly replace BroadcastChannel before tests run
const MockBroadcastChannel = createMockBroadcastChannel();
vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);

// Also ensure it's available on the window object in JSDOM
if (typeof window !== 'undefined') {
  (window as any).BroadcastChannel = MockBroadcastChannel;
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});

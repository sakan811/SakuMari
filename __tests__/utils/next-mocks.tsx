import { vi } from "vitest";
import React from "react";

// Common Next.js component mocks

// Mock next/navigation
export const mockNextNavigation = () => {
  vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
      replace: vi.fn(),
      push: vi.fn(),
      back: vi.fn(),
      refresh: vi.fn(),
    })),
    usePathname: vi.fn(() => "/"),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    redirect: vi.fn(),
    notFound: vi.fn(),
  }));
};

// Mock next/link
export const mockNextLink = () => {
  vi.mock("next/link", () => ({
    default: ({ children, href, ...props }: any) => {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  }));
};

// Mock next/image
export const mockNextImage = () => {
  vi.mock("next/image", () => ({
    default: ({ src, alt, ...props }: any) => {
      return <img src={src} alt={alt} {...props} />;
    },
  }));
};

// Mock next-auth/react with common session scenarios
export const mockNextAuth = (sessionConfig: any = {}) => {
  const defaultSession = {
    data: { user: { id: "user123", name: "Test User" } },
    status: "authenticated",
  };

  vi.mock("next-auth/react", () => ({
    useSession: vi.fn(() => ({ ...defaultSession, ...sessionConfig })),
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: any) => children,
  }));
};

// Convenience function to set up common UI test mocks
interface SetupUITestMocksOptions {
  includeNavigation?: boolean;
  includeLink?: boolean;
  includeImage?: boolean;
  includeAuth?: boolean;
  sessionConfig?: any;
}

export const setupUITestMocks = (options: SetupUITestMocksOptions = {}) => {
  const {
    includeNavigation = true,
    includeLink = true,
    includeImage = false,
    includeAuth = true,
    sessionConfig = {},
  } = options;

  if (includeNavigation) mockNextNavigation();
  if (includeLink) mockNextLink();
  if (includeImage) mockNextImage();
  if (includeAuth) mockNextAuth(sessionConfig);
};

// Mock session configurations for different test scenarios
export const sessionConfigs = {
  authenticated: {
    data: { user: { id: "user123", name: "Test User" } },
    status: "authenticated",
  },
  unauthenticated: {
    data: null,
    status: "unauthenticated",
  },
  loading: {
    data: null,
    status: "loading",
  },
};

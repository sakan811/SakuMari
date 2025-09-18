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

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Store original environment variables
const originalEnv = { ...process.env };

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

// Mock NextAuth providers and adapter
const mockGoogleProvider = vi.fn((config) => ({
  id: "google",
  name: "Google",
  type: "oauth",
  clientId: config.clientId,
  clientSecret: config.clientSecret,
}));

const mockCredentialsProvider = vi.fn((config) => ({
  id: "credentials",
  name: "Email & Password",
  type: "credentials",
  authorize: config.authorize,
}));

const mockPrismaAdapter = vi.fn(() => ({ name: "PrismaAdapter" }));

const mockNextAuth = vi.fn((config) => ({
  handlers: { GET: vi.fn(), POST: vi.fn() },
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  config,
}));

// Mock all dependencies
vi.mock("next-auth", () => ({ default: mockNextAuth }));
vi.mock("next-auth/providers/google", () => ({ default: mockGoogleProvider }));
vi.mock("next-auth/providers/credentials", () => ({
  default: mockCredentialsProvider,
}));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: mockPrismaAdapter }));

// Helper functions
const setupEnvironment = (envVars: Record<string, string>) => {
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("AUTH_") || key.startsWith("CREDS_") || key.startsWith("NEXTAUTH_") || key === "NODE_ENV") {
      delete process.env[key];
    }
  });

  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

const getAuthConfig = async () => {
  const { handlers } = await import("@/lib/auth");
  return mockNextAuth.mock.calls[0][0];
};

const resetAndReSetupMocks = () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.mock("@/lib/prisma", () => ({
    prisma: {
      $connect: vi.fn(),
      $disconnect: vi.fn(),
    },
  }));
  vi.mock("next-auth", () => ({ default: mockNextAuth }));
  vi.mock("next-auth/providers/google", () => ({ default: mockGoogleProvider }));
  vi.mock("next-auth/providers/credentials", () => ({
    default: mockCredentialsProvider,
  }));
  vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: mockPrismaAdapter }));
};

const testCookieConfiguration = async (envVars: Record<string, string>, expectedDomain: string | undefined) => {
  setupEnvironment(envVars);
  const config = await getAuthConfig();

  expect(config.cookies.pkceCodeVerifier.options.domain).toBe(expectedDomain);
  expect(config.cookies.state.options.domain).toBe(expectedDomain);
};

const testCookieSecureFlag = async (envVars: Record<string, string>, expectedSecure: boolean) => {
  setupEnvironment(envVars);
  const config = await getAuthConfig();

  expect(config.cookies.pkceCodeVerifier.options.secure).toBe(expectedSecure);
  expect(config.cookies.state.options.secure).toBe(expectedSecure);
};

describe("Google OAuth Redirect Callback Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupEnvironment({});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe("getAuthUrl() function tests", () => {
    test.each([
      {
        scenario: "returns AUTH_URL when set",
        env: { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" },
        expectedDomain: "sakumari.com",
      },
      {
        scenario: "ignores NEXTAUTH_URL when AUTH_URL is set",
        env: { AUTH_URL: "https://auth.sakumari.com", NEXTAUTH_URL: "https://sakumari.com", NODE_ENV: "production" },
        expectedDomain: "auth.sakumari.com",
      },
      {
        scenario: "defaults to localhost when neither AUTH_URL nor NEXTAUTH_URL is set",
        env: { NODE_ENV: "production" },
        expectedDomain: "localhost:3000",
      },
      {
        scenario: "handles URLs with http protocol correctly",
        env: { AUTH_URL: "http://localhost:3000", NODE_ENV: "production" },
        expectedDomain: "localhost:3000",
      },
      {
        scenario: "handles URLs with https protocol correctly",
        env: { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" },
        expectedDomain: "sakumari.com",
      },
      {
        scenario: "handles URLs with port numbers correctly",
        env: { AUTH_URL: "https://sakumari.com:3001", NODE_ENV: "production" },
        expectedDomain: "sakumari.com:3001",
      },
      {
        scenario: "handles complex subdomain URLs correctly",
        env: { AUTH_URL: "https://app.staging.sakumari.com", NODE_ENV: "production" },
        expectedDomain: "app.staging.sakumari.com",
      },
    ])("$scenario", async ({ env, expectedDomain }) => {
      setupEnvironment(env);
      const config = await getAuthConfig();

      expect(config.cookies.pkceCodeVerifier.options.domain).toBe(expectedDomain);
    });
  });

  describe("Cookie configuration tests", () => {
    test.each([
      {
        scenario: "cookie domain is undefined in development environment",
        env: { AUTH_URL: "https://sakumari.com", NODE_ENV: "development" },
        expectedDomain: undefined,
      },
      {
        scenario: "cookie domain is set correctly in production environment",
        env: { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" },
        expectedDomain: "sakumari.com",
      },
    ])("$scenario", async ({ env, expectedDomain }) => {
      await testCookieConfiguration(env, expectedDomain);
    });

    test("both pkceCodeVerifier and state cookies have same domain configuration", async () => {
      const env = { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" };
      setupEnvironment(env);
      const config = await getAuthConfig();

      expect(config.cookies.pkceCodeVerifier.options.domain).toBe(config.cookies.state.options.domain);
    });

    test.each([
      {
        scenario: "cookie secure flag is false in development",
        env: { AUTH_URL: "https://sakumari.com", NODE_ENV: "development" },
        expectedSecure: false,
      },
      {
        scenario: "cookie secure flag is true in production",
        env: { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" },
        expectedSecure: true,
      },
    ])("$scenario", async ({ env, expectedSecure }) => {
      await testCookieSecureFlag(env, expectedSecure);
    });

    const baseEnv = { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" };

    test.each([
      {
        scenario: "cookie sameSite is always lax",
        property: "sameSite",
        expectedValue: "lax",
      },
      {
        scenario: "cookie httpOnly is always true",
        property: "httpOnly",
        expectedValue: true,
      },
      {
        scenario: "cookie path is always root",
        property: "path",
        expectedValue: "/",
      },
    ])("$scenario", async ({ property, expectedValue }) => {
      setupEnvironment(baseEnv);
      const config = await getAuthConfig();

      expect(config.cookies.pkceCodeVerifier.options[property]).toBe(expectedValue);
      expect(config.cookies.state.options[property]).toBe(expectedValue);
    });
  });

  describe("OAuth flow tests", () => {
    test("Google OAuth provider is properly configured", async () => {
      const env = { AUTH_GOOGLE_ID: "test-google-id", AUTH_GOOGLE_SECRET: "test-google-secret" };
      setupEnvironment(env);
      await getAuthConfig();

      expect(mockGoogleProvider).toHaveBeenCalledWith({
        clientId: "test-google-id",
        clientSecret: "test-google-secret",
      });
    });

    test("OAuth flow uses correct base URL for redirects", async () => {
      const env = { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" };
      await testCookieConfiguration(env, "sakumari.com");
    });

    test("OAuth cookies prevent cross-domain redirects", async () => {
      const env = { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" };

      // First import (simulating initial login)
      setupEnvironment(env);
      await getAuthConfig();
      const firstConfig = mockNextAuth.mock.calls[0][0];

      // Reset modules to simulate logout/login cycle
      resetAndReSetupMocks();
      setupEnvironment(env);

      // Second import (simulating login after logout)
      await getAuthConfig();
      const secondConfig = mockNextAuth.mock.calls[0][0];

      // Cookie configuration should be consistent across sessions
      expect(firstConfig.cookies.pkceCodeVerifier.options.domain).toBe(secondConfig.cookies.pkceCodeVerifier.options.domain);
      expect(firstConfig.cookies.state.options.domain).toBe(secondConfig.cookies.state.options.domain);
    });

    test.each([
      {
        scenario: "PKCE code verifier cookie has correct name and configuration",
        cookieName: "pkceCodeVerifier",
        expectedName: "next-auth.pkce.code_verifier",
      },
      {
        scenario: "State cookie has correct name and configuration",
        cookieName: "state",
        expectedName: "next-auth.state",
      },
    ])("$scenario", async ({ cookieName, expectedName }) => {
      const env = { AUTH_URL: "https://sakumari.com", NODE_ENV: "production" };
      setupEnvironment(env);
      const config = await getAuthConfig();

      expect(config.cookies[cookieName].name).toBe(expectedName);
      expect(config.cookies[cookieName].options).toEqual({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: "sakumari.com",
      });
    });
  });

  describe("Environment variable combination tests", () => {
    test.each([
      {
        scenario: "handles empty string environment variables",
        env: { AUTH_URL: "", NODE_ENV: "production" },
        expectedDomain: "localhost:3000",
      },
      {
        scenario: "handles whitespace in environment variables",
        env: { AUTH_URL: "  https://sakumari.com  ", NODE_ENV: "production" },
        expectedDomain: "  https://sakumari.com  ",
      },
      {
        scenario: "handles malformed URLs gracefully",
        env: { AUTH_URL: "not-a-valid-url", NODE_ENV: "production" },
        expectedDomain: "not-a-valid-url",
      },
      {
        scenario: "handles URL with query parameters",
        env: { AUTH_URL: "https://sakumari.com?param=value", NODE_ENV: "production" },
        expectedDomain: "sakumari.com?param=value",
      },
      {
        scenario: "handles URL with path",
        env: { AUTH_URL: "https://sakumari.com/auth", NODE_ENV: "production" },
        expectedDomain: "sakumari.com/auth",
      },
    ])("$scenario", async ({ env, expectedDomain }) => {
      await testCookieConfiguration(env, expectedDomain);
    });

    test("different production domains have different cookie domains", async () => {
      const testCases = [
        { url: "https://staging.sakumari.com", expected: "staging.sakumari.com" },
        { url: "https://app.sakumari.com", expected: "app.sakumari.com" },
        { url: "https://sakumari.dev", expected: "sakumari.dev" },
      ];

      for (const testCase of testCases) {
        resetAndReSetupMocks();
        const env = { AUTH_URL: testCase.url, NODE_ENV: "production" };
        await testCookieConfiguration(env, testCase.expected);
      }
    });
  });

  describe("Integration tests for logout/login redirect issue", () => {
    test("simulates the production environment issue scenario", async () => {
      const productionDomain = "https://sakumari.com";
      const baseEnv = {
        AUTH_URL: productionDomain,
        NODE_ENV: "production",
        AUTH_GOOGLE_ID: "test-google-id",
        AUTH_GOOGLE_SECRET: "test-google-secret",
      };

      // Simulate initial login
      setupEnvironment(baseEnv);
      await getAuthConfig();
      const initialConfig = mockNextAuth.mock.calls[0][0];

      // Verify initial configuration uses production domain
      expect(initialConfig.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
      expect(initialConfig.cookies.state.options.domain).toBe("sakumari.com");

      // Reset to simulate logout (clear modules and mocks)
      resetAndReSetupMocks();
      setupEnvironment(baseEnv);

      // Simulate login after logout
      await getAuthConfig();
      const secondConfig = mockNextAuth.mock.calls[0][0];

      // Critical: Second login should still use production domain, not localhost
      expect(secondConfig.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
      expect(secondConfig.cookies.state.options.domain).toBe("sakumari.com");

      // Ensure it's NOT using localhost
      expect(secondConfig.cookies.pkceCodeVerifier.options.domain).not.toBe("localhost:3000");
      expect(secondConfig.cookies.state.options.domain).not.toBe("localhost:3000");
    });

    test("ensures cookie domain consistency across multiple auth cycles", async () => {
      const domain = "https://app.sakumari.com";
      const baseEnv = {
        AUTH_URL: domain,
        NODE_ENV: "production",
        AUTH_GOOGLE_ID: "test-google-id",
        AUTH_GOOGLE_SECRET: "test-google-secret",
      };

      // Simulate multiple auth cycles
      const authConfigs = [];
      for (let i = 0; i < 3; i++) {
        resetAndReSetupMocks();
        setupEnvironment(baseEnv);
        await getAuthConfig();
        authConfigs.push(mockNextAuth.mock.calls[0][0]);
      }

      // All configurations should have the same domain
      const expectedDomain = "app.sakumari.com";
      authConfigs.forEach((config) => {
        expect(config.cookies.pkceCodeVerifier.options.domain).toBe(expectedDomain);
        expect(config.cookies.state.options.domain).toBe(expectedDomain);
      });
    });

    test("prevents localhost redirect in production when AUTH_URL is properly set", async () => {
      const env = {
        AUTH_URL: "https://sakumari.com",
        NODE_ENV: "production",
        AUTH_GOOGLE_ID: "test-google-id",
        AUTH_GOOGLE_SECRET: "test-google-secret",
      };

      setupEnvironment(env);
      await getAuthConfig();
      const config = mockNextAuth.mock.calls[0][0];

      // The critical test: cookie domain should NOT be localhost in production
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
      expect(config.cookies.state.options.domain).toBe("sakumari.com");

      // Explicitly check it's not localhost
      expect(config.cookies.pkceCodeVerifier.options.domain).not.toContain("localhost");
      expect(config.cookies.state.options.domain).not.toContain("localhost");
    });

    test("handles environment variable changes between auth cycles", async () => {
      const baseCredentials = {
        AUTH_GOOGLE_ID: "test-google-id",
        AUTH_GOOGLE_SECRET: "test-google-secret",
      };

      // First cycle: staging environment
      const stagingEnv = {
        ...baseCredentials,
        AUTH_URL: "https://staging.sakumari.com",
        NODE_ENV: "production",
      };
      setupEnvironment(stagingEnv);
      await getAuthConfig();
      const stagingConfig = mockNextAuth.mock.calls[0][0];

      // Reset and switch to production
      resetAndReSetupMocks();

      // Second cycle: production environment
      const productionEnv = {
        ...baseCredentials,
        AUTH_URL: "https://sakumari.com",
        NODE_ENV: "production",
      };
      setupEnvironment(productionEnv);
      await getAuthConfig();
      const productionConfig = mockNextAuth.mock.calls[0][0];

      // Each environment should use its own domain
      expect(stagingConfig.cookies.pkceCodeVerifier.options.domain).toBe("staging.sakumari.com");
      expect(productionConfig.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
    });
  });
});
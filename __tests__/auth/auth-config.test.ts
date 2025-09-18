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

// Mock Prisma first
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

describe("Auth Configuration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment to clean state
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("AUTH_") || key.startsWith("CREDS_")) {
        delete process.env[key];
      }
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe("isCredentialsProviderEnabled function (lines 77-79)", () => {
    test("returns true when CREDS_PROVIDER is 'true'", async () => {
      process.env.CREDS_PROVIDER = "true";

      // Import after setting env vars to test actual function
      const { isCredentialsProviderEnabled } = await import("@/lib/auth");

      expect(isCredentialsProviderEnabled()).toBe(true);
    });

    test("returns false when CREDS_PROVIDER is not set", async () => {
      delete process.env.CREDS_PROVIDER;

      const { isCredentialsProviderEnabled } = await import("@/lib/auth");

      expect(isCredentialsProviderEnabled()).toBe(false);
    });

    test("returns false when CREDS_PROVIDER is 'false'", async () => {
      process.env.CREDS_PROVIDER = "false";

      const { isCredentialsProviderEnabled } = await import("@/lib/auth");

      expect(isCredentialsProviderEnabled()).toBe(false);
    });

    test("returns false when CREDS_PROVIDER is empty string", async () => {
      process.env.CREDS_PROVIDER = "";

      const { isCredentialsProviderEnabled } = await import("@/lib/auth");

      expect(isCredentialsProviderEnabled()).toBe(false);
    });
  });

  describe("Google Provider Configuration (lines 26-29)", () => {
    beforeEach(() => {
      // Set required environment variables for providers
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
    });

    test("Google provider is configured with correct environment variables", async () => {
      // Import auth module to trigger provider creation
      await import("@/lib/auth");

      // Verify Google provider was called with correct config
      expect(mockGoogleProvider).toHaveBeenCalledWith({
        clientId: "test-google-id",
        clientSecret: "test-google-secret",
      });
    });

    test("Google provider handles undefined environment variables", async () => {
      delete process.env.AUTH_GOOGLE_ID;
      delete process.env.AUTH_GOOGLE_SECRET;

      // Should still create provider (will get undefined values)
      await import("@/lib/auth");

      expect(mockGoogleProvider).toHaveBeenCalledWith({
        clientId: undefined,
        clientSecret: undefined,
      });
    });
  });

  describe("Credentials Provider Configuration and Authorization (lines 32-62)", () => {
    beforeEach(() => {
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
      process.env.CREDS_TEST_EMAIL = "test@sakumari.local";
      process.env.CREDS_TEST_PASSWORD = "TestPassword123!";
      process.env.CREDS_PROVIDER = "true";
    });

    test("credentials provider is configured with correct structure", async () => {
      await import("@/lib/auth");

      expect(mockCredentialsProvider).toHaveBeenCalledWith({
        id: "credentials",
        name: "Email & Password",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: expect.any(Function),
      });
    });

    test("authorize function returns user for valid test credentials", async () => {
      await import("@/lib/auth");

      // Get the authorize function from the mock call
      const authorizeCall = mockCredentialsProvider.mock.calls[0][0];
      const authorize = authorizeCall.authorize;

      const result = await authorize({
        email: "test@sakumari.local",
        password: "TestPassword123!",
      });

      expect(result).toEqual({
        id: "test-user-e2e",
        email: "test@sakumari.local",
        name: "Test User",
        image: null,
      });
    });

    test("authorize function returns null for invalid credentials", async () => {
      await import("@/lib/auth");

      const authorizeCall = mockCredentialsProvider.mock.calls[0][0];
      const authorize = authorizeCall.authorize;

      const result = await authorize({
        email: "wrong@email.com",
        password: "WrongPassword",
      });

      expect(result).toBeNull();
    });

    test("authorize function returns null for missing credentials", async () => {
      await import("@/lib/auth");

      const authorizeCall = mockCredentialsProvider.mock.calls[0][0];
      const authorize = authorizeCall.authorize;

      // Test missing email
      expect(await authorize({ password: "TestPassword123!" })).toBeNull();

      // Test missing password
      expect(await authorize({ email: "test@sakumari.local" })).toBeNull();

      // Test no credentials
      expect(await authorize({})).toBeNull();
    });

    test("authorize function uses environment variable defaults", async () => {
      delete process.env.CREDS_TEST_EMAIL;
      delete process.env.CREDS_TEST_PASSWORD;

      await import("@/lib/auth");

      const authorizeCall = mockCredentialsProvider.mock.calls[0][0];
      const authorize = authorizeCall.authorize;

      // Should use default values
      const result = await authorize({
        email: "test@sakumari.local",
        password: "TestPassword123!",
      });

      expect(result).toEqual({
        id: "test-user-e2e",
        email: "test@sakumari.local",
        name: "Test User",
        image: null,
      });
    });
  });

  describe("Provider Array Logic (getProviders function lines 65-74)", () => {
    beforeEach(() => {
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
    });

    test("includes only Google provider when credentials provider is disabled", async () => {
      delete process.env.CREDS_PROVIDER;

      // Reset and re-import to ensure fresh environment
      vi.resetModules();
      vi.clearAllMocks();

      // Re-setup mocks after reset
      vi.mock("@/lib/prisma", () => ({
        prisma: {
          $connect: vi.fn(),
          $disconnect: vi.fn(),
        },
      }));

      await import("@/lib/auth");

      // Should be called with array containing only Google provider
      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      expect(nextAuthCall.providers).toHaveLength(1);
      expect(nextAuthCall.providers[0]).toEqual({
        id: "google",
        name: "Google",
        type: "oauth",
        clientId: "test-google-id",
        clientSecret: "test-google-secret",
      });
    });

    test("includes both Google and credentials providers when credentials provider is enabled", async () => {
      process.env.CREDS_PROVIDER = "true";

      await import("@/lib/auth");

      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      expect(nextAuthCall.providers).toHaveLength(2);
      expect(nextAuthCall.providers[0].id).toBe("google");
      expect(nextAuthCall.providers[1].id).toBe("credentials");
    });
  });

  describe("NextAuth Configuration Object (lines 81-124)", () => {
    beforeEach(() => {
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
      // NODE_ENV is typically set by test runner, don't override here
    });

    test("NextAuth is configured with PrismaAdapter", async () => {
      await import("@/lib/auth");

      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      expect(nextAuthCall.adapter).toEqual({ name: "PrismaAdapter" });
      expect(mockPrismaAdapter).toHaveBeenCalled();
    });

    test("session configuration is correct", async () => {
      await import("@/lib/auth");

      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      expect(nextAuthCall.session).toEqual({
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    });

    test("trustHost is enabled", async () => {
      await import("@/lib/auth");

      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      expect(nextAuthCall.trustHost).toBe(true);
    });

    
    test("JWT callback injects user ID into token", async () => {
      await import("@/lib/auth");

      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      const jwtCallback = nextAuthCall.callbacks.jwt;

      const token = {};
      const user = { id: "user123" };

      const result = jwtCallback({ token, user });
      expect(result).toEqual({ id: "user123" });
    });

    test("JWT callback preserves token when no user provided", async () => {
      await import("@/lib/auth");

      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      const jwtCallback = nextAuthCall.callbacks.jwt;

      const token = { id: "existing-id", other: "data" };

      const result = jwtCallback({ token });
      expect(result).toEqual({ id: "existing-id", other: "data" });
    });

    test("session callback injects user ID from token", async () => {
      await import("@/lib/auth");

      const nextAuthCall = mockNextAuth.mock.calls[0][0];
      const sessionCallback = nextAuthCall.callbacks.session;

      const session = {
        user: { name: "Test User", email: "test@example.com" },
        expires: "2024-01-01",
      };
      const token = { id: "user123" };

      const result = sessionCallback({ session, token });
      expect(result).toEqual({
        ...session,
        user: {
          ...session.user,
          id: "user123",
        },
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("Google provider handles missing environment variables", async () => {
      delete process.env.AUTH_GOOGLE_ID;
      delete process.env.AUTH_GOOGLE_SECRET;

      // Should not throw when importing auth config with undefined env vars
      expect(async () => {
        await import("@/lib/auth");
      }).not.toThrow();
    });

    test("credential provider uses environment variable defaults", async () => {
      process.env.CREDS_TEST_EMAIL = "";
      process.env.CREDS_TEST_PASSWORD = "";
      process.env.CREDS_PROVIDER = "true";

      await import("@/lib/auth");

      const authorizeCall = mockCredentialsProvider.mock.calls[0][0];
      const authorize = authorizeCall.authorize;

      // Should use defaults when env vars are empty
      const result = await authorize({
        email: "test@sakumari.local",
        password: "TestPassword123!",
      });

      expect(result).toEqual({
        id: "test-user-e2e",
        email: "test@sakumari.local",
        name: "Test User",
        image: null,
      });
    });
  });
});

// Integration test to ensure all auth exports are available
describe("Auth Module Exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_GOOGLE_ID = "test-google-id";
    process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  test("auth module exports all required functions", async () => {
    const { handlers, auth, signIn, signOut, isCredentialsProviderEnabled } =
      await import("@/lib/auth");

    expect(handlers).toBeDefined();
    expect(auth).toBeDefined();
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
    expect(isCredentialsProviderEnabled).toBeTypeOf("function");
  });
});

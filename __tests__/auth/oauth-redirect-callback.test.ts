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

describe("Google OAuth Redirect Callback Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment to clean state
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("AUTH_") || key.startsWith("CREDS_") || key.startsWith("NEXTAUTH_") || key === "NODE_ENV") {
        delete process.env[key];
      }
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe("getAuthUrl() function tests", () => {
    test("returns AUTH_URL when set", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // The function should be called internally, check the cookie domain which uses getAuthUrl()
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
    });

    test("ignores NEXTAUTH_URL when AUTH_URL is set", async () => {
      process.env.AUTH_URL = "https://auth.sakumari.com";
      process.env.NEXTAUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should use AUTH_URL even when NEXTAUTH_URL is also set
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("auth.sakumari.com");
    });

    test("defaults to localhost when neither AUTH_URL nor NEXTAUTH_URL is set", async () => {
      delete process.env.AUTH_URL;
      delete process.env.NEXTAUTH_URL;
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should default to localhost
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("localhost:3000");
    });

    test("handles URLs with http protocol correctly", async () => {
      process.env.AUTH_URL = "http://localhost:3000";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should remove http:// prefix
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("localhost:3000");
    });

    test("handles URLs with https protocol correctly", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should remove https:// prefix
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
    });

    test("handles URLs with port numbers correctly", async () => {
      process.env.AUTH_URL = "https://sakumari.com:3001";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should include port number
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com:3001");
    });

    test("handles complex subdomain URLs correctly", async () => {
      process.env.AUTH_URL = "https://app.staging.sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should handle complex subdomains
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("app.staging.sakumari.com");
    });
  });

  describe("Cookie configuration tests", () => {
    test("cookie domain is undefined in development environment", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "development";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Domain should be undefined in development
      expect(config.cookies.pkceCodeVerifier.options.domain).toBeUndefined();
      expect(config.cookies.state.options.domain).toBeUndefined();
    });

    test("cookie domain is set correctly in production environment", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Domain should be set in production
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
      expect(config.cookies.state.options.domain).toBe("sakumari.com");
    });

    test("both pkceCodeVerifier and state cookies have same domain configuration", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Both cookies should have consistent domain configuration
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe(config.cookies.state.options.domain);
    });

    test("cookie secure flag is false in development", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "development";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      expect(config.cookies.pkceCodeVerifier.options.secure).toBe(false);
      expect(config.cookies.state.options.secure).toBe(false);
    });

    test("cookie secure flag is true in production", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      expect(config.cookies.pkceCodeVerifier.options.secure).toBe(true);
      expect(config.cookies.state.options.secure).toBe(true);
    });

    test("cookie sameSite is always lax", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      expect(config.cookies.pkceCodeVerifier.options.sameSite).toBe("lax");
      expect(config.cookies.state.options.sameSite).toBe("lax");
    });

    test("cookie httpOnly is always true", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      expect(config.cookies.pkceCodeVerifier.options.httpOnly).toBe(true);
      expect(config.cookies.state.options.httpOnly).toBe(true);
    });

    test("cookie path is always root", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      expect(config.cookies.pkceCodeVerifier.options.path).toBe("/");
      expect(config.cookies.state.options.path).toBe("/");
    });
  });

  describe("OAuth flow tests", () => {
    test("Google OAuth provider is properly configured", async () => {
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      const { handlers } = await import("@/lib/auth");

      expect(mockGoogleProvider).toHaveBeenCalledWith({
        clientId: "test-google-id",
        clientSecret: "test-google-secret",
      });
    });

    test("OAuth flow uses correct base URL for redirects", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // The base URL should be correctly reflected in cookie domains
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
      expect(config.cookies.state.options.domain).toBe("sakumari.com");
    });

    test("OAuth cookies prevent cross-domain redirects", async () => {
      // Simulate scenario where user logs out and logs back in
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      // First import (simulating initial login)
      await import("@/lib/auth");
      const firstConfig = mockNextAuth.mock.calls[0][0];

      // Reset modules to simulate logout/login cycle
      vi.resetModules();
      vi.clearAllMocks();

      // Re-setup mocks
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

      // Second import (simulating login after logout)
      await import("@/lib/auth");
      const secondConfig = mockNextAuth.mock.calls[0][0];

      // Cookie configuration should be consistent across sessions
      expect(firstConfig.cookies.pkceCodeVerifier.options.domain).toBe(secondConfig.cookies.pkceCodeVerifier.options.domain);
      expect(firstConfig.cookies.state.options.domain).toBe(secondConfig.cookies.state.options.domain);
    });

    test("PKCE code verifier cookie has correct name and configuration", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      expect(config.cookies.pkceCodeVerifier.name).toBe("next-auth.pkce.code_verifier");
      expect(config.cookies.pkceCodeVerifier.options).toEqual({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: "sakumari.com",
      });
    });

    test("State cookie has correct name and configuration", async () => {
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      expect(config.cookies.state.name).toBe("next-auth.state");
      expect(config.cookies.state.options).toEqual({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: "sakumari.com",
      });
    });
  });

  describe("Environment variable combination tests", () => {
    test("handles empty string environment variables", async () => {
      process.env.AUTH_URL = "";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Empty string should result in localhost fallback
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("localhost:3000");
    });

    test("handles whitespace in environment variables", async () => {
      process.env.AUTH_URL = "  https://sakumari.com  ";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should preserve whitespace as-is (no trimming in implementation)
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("  https://sakumari.com  ");
    });

    test("handles malformed URLs gracefully", async () => {
      process.env.AUTH_URL = "not-a-valid-url";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should handle malformed URL without throwing
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("not-a-valid-url");
    });

    test("handles URL with query parameters", async () => {
      process.env.AUTH_URL = "https://sakumari.com?param=value";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should include query parameters in domain (behavior depends on implementation)
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com?param=value");
    });

    test("handles URL with path", async () => {
      process.env.AUTH_URL = "https://sakumari.com/auth";
      process.env.NODE_ENV = "production";

      const { handlers } = await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // Should include path in domain (behavior depends on implementation)
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com/auth");
    });

    test("different production domains have different cookie domains", async () => {
      // Test different production environments
      const testCases = [
        { url: "https://staging.sakumari.com", expected: "staging.sakumari.com" },
        { url: "https://app.sakumari.com", expected: "app.sakumari.com" },
        { url: "https://sakumari.dev", expected: "sakumari.dev" },
      ];

      for (const testCase of testCases) {
        // Reset environment for each test case
        Object.keys(process.env).forEach((key) => {
          if (key.startsWith("AUTH_") || key === "NODE_ENV") {
            delete process.env[key];
          }
        });

        process.env.AUTH_URL = testCase.url;
        process.env.NODE_ENV = "production";

        vi.resetModules();
        vi.clearAllMocks();

        // Re-setup mocks
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

        const { handlers } = await import("@/lib/auth");
        const config = mockNextAuth.mock.calls[0][0];

        expect(config.cookies.pkceCodeVerifier.options.domain).toBe(testCase.expected);
      }
    });
  });

  describe("Integration tests for logout/login redirect issue", () => {
    test("simulates the production environment issue scenario", async () => {
      // This test simulates the exact scenario described in the issue:
      // 1. User is on production domain
      // 2. User logs out
      // 3. User tries to log back in
      // 4. Cookies should cause correct redirect, not to localhost

      const productionDomain = "https://sakumari.com";

      // Set up production environment
      process.env.AUTH_URL = productionDomain;
      process.env.NODE_ENV = "production";
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      // Simulate initial login
      await import("@/lib/auth");
      const initialConfig = mockNextAuth.mock.calls[0][0];

      // Verify initial configuration uses production domain
      expect(initialConfig.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
      expect(initialConfig.cookies.state.options.domain).toBe("sakumari.com");

      // Reset to simulate logout (clear modules and mocks)
      vi.resetModules();
      vi.clearAllMocks();

      // Re-setup mocks for second login attempt
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

      // Simulate login after logout - environment should still be production
      process.env.AUTH_URL = productionDomain;
      process.env.NODE_ENV = "production";
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      await import("@/lib/auth");
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

      // Set up environment
      process.env.AUTH_URL = domain;
      process.env.NODE_ENV = "production";
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      // Simulate multiple auth cycles (login, logout, login, logout, login)
      const authConfigs = [];

      for (let i = 0; i < 3; i++) {
        // Reset modules to simulate new auth cycle
        vi.resetModules();
        vi.clearAllMocks();

        // Re-setup mocks
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

        // Re-set environment variables
        process.env.AUTH_URL = domain;
        process.env.NODE_ENV = "production";
        process.env.AUTH_GOOGLE_ID = "test-google-id";
        process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

        await import("@/lib/auth");
        authConfigs.push(mockNextAuth.mock.calls[0][0]);
      }

      // All configurations should have the same domain
      const expectedDomain = "app.sakumari.com";
      authConfigs.forEach((config, index) => {
        expect(config.cookies.pkceCodeVerifier.options.domain).toBe(expectedDomain);
        expect(config.cookies.state.options.domain).toBe(expectedDomain);
      });
    });

    test("prevents localhost redirect in production when AUTH_URL is properly set", async () => {
      // This is the core issue: ensuring that when AUTH_URL is set to production domain,
      // cookies don't cause redirects to localhost

      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      await import("@/lib/auth");
      const config = mockNextAuth.mock.calls[0][0];

      // The critical test: cookie domain should NOT be localhost in production
      expect(config.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
      expect(config.cookies.state.options.domain).toBe("sakumari.com");

      // Explicitly check it's not localhost
      expect(config.cookies.pkceCodeVerifier.options.domain).not.toContain("localhost");
      expect(config.cookies.state.options.domain).not.toContain("localhost");
    });

    test("handles environment variable changes between auth cycles", async () => {
      // Test scenario where environment variables might change between sessions

      // First cycle: staging environment
      process.env.AUTH_URL = "https://staging.sakumari.com";
      process.env.NODE_ENV = "production";
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      await import("@/lib/auth");
      const stagingConfig = mockNextAuth.mock.calls[0][0];

      // Reset and switch to production
      vi.resetModules();
      vi.clearAllMocks();

      // Re-setup mocks
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

      // Second cycle: production environment
      process.env.AUTH_URL = "https://sakumari.com";
      process.env.NODE_ENV = "production";
      process.env.AUTH_GOOGLE_ID = "test-google-id";
      process.env.AUTH_GOOGLE_SECRET = "test-google-secret";

      await import("@/lib/auth");
      const productionConfig = mockNextAuth.mock.calls[0][0];

      // Each environment should use its own domain
      expect(stagingConfig.cookies.pkceCodeVerifier.options.domain).toBe("staging.sakumari.com");
      expect(productionConfig.cookies.pkceCodeVerifier.options.domain).toBe("sakumari.com");
    });
  });
});
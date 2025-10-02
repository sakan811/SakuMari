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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@/generated/prisma_client";

// Store original environment variables
const originalEnv = { ...process.env };

// Mock the PrismaClient and adapter
vi.mock("@/generated/prisma_client", () => ({
  PrismaClient: vi.fn().mockImplementation((config) => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    config,
  })),
}));

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: vi.fn().mockImplementation((config) => ({
    adapterName: "@prisma/adapter-pg",
    config,
    externalPool: null,
    options: undefined,
    provider: "postgres",
  })),
}));

// Mock the getDatabaseUrls function
const mockGetDatabaseUrls = vi.fn();
vi.mock("@/lib/env", () => ({
  getDatabaseUrls: () => mockGetDatabaseUrls(),
}));

describe("Prisma Client Configuration", () => {
  beforeEach(() => {
    // Reset modules and mocks before each test
    vi.resetModules();
    vi.clearAllMocks();

    // Reset process.env
    process.env = { ...originalEnv };

    // Reset global object
    delete (global as typeof globalThis & { prisma?: unknown }).prisma;

    // Default mock implementation for getDatabaseUrls
    mockGetDatabaseUrls.mockReturnValue({
      POSTGRES_PRISMA_URL:
        "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
      POSTGRES_URL_NON_POOLING:
        "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;

    // Clean up global prisma
    delete (global as typeof globalThis & { prisma?: unknown }).prisma;

    // Reset all environment stubs
    vi.unstubAllEnvs();
  });

  it("should create a new PrismaClient when global prisma is not set", async () => {
    // Import the module after setting up mocks
    const { prisma } = await import("@/lib/prisma");

    // Verify getDatabaseUrls was called
    expect(mockGetDatabaseUrls).toHaveBeenCalled();

    // Verify PrismaClient was instantiated with adapter
    expect(PrismaClient).toHaveBeenCalledWith({
      adapter: expect.objectContaining({
        adapterName: "@prisma/adapter-pg",
        config: {
          connectionString:
            "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
        },
        externalPool: null,
        options: undefined,
        provider: "postgres",
      }),
      log: ["error"], // Default log level (non-development)
    });

    // Verify the returned prisma instance
    expect(prisma).toBeDefined();
  });

  it("should use existing global prisma client when available", async () => {
    // Create a mock prisma client
    const mockPrismaClient = { $connect: vi.fn(), $disconnect: vi.fn() };

    // Set the global prisma client
    (global as unknown as { prisma: typeof mockPrismaClient }).prisma =
      mockPrismaClient;

    // Import the module after setting up mocks
    const { prisma } = await import("@/lib/prisma");

    // Verify getDatabaseUrls was still called
    expect(mockGetDatabaseUrls).toHaveBeenCalled();

    // Verify PrismaClient was NOT instantiated again
    expect(PrismaClient).not.toHaveBeenCalled();

    // Verify the returned prisma instance is the global one
    expect(prisma).toBe(mockPrismaClient);
  });

  it("should configure development log levels when NODE_ENV is development", async () => {
    // Set NODE_ENV to development
    vi.stubEnv("NODE_ENV", "development");

    // Import the module after setting up mocks
    await import("@/lib/prisma");

    // Verify PrismaClient was instantiated with development log levels
    expect(PrismaClient).toHaveBeenCalledWith({
      adapter: expect.objectContaining({
        adapterName: "@prisma/adapter-pg",
        config: {
          connectionString:
            "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
        },
        externalPool: null,
        options: undefined,
        provider: "postgres",
      }),
      log: ["query", "error", "warn"],
    });
  });

  it("should configure production log levels when NODE_ENV is production", async () => {
    // Set NODE_ENV to production
    vi.stubEnv("NODE_ENV", "production");

    // Import the module after setting up mocks
    await import("@/lib/prisma");

    // Verify PrismaClient was instantiated with production log levels
    expect(PrismaClient).toHaveBeenCalledWith({
      adapter: expect.objectContaining({
        adapterName: "@prisma/adapter-pg",
        config: {
          connectionString:
            "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
        },
        externalPool: null,
        options: undefined,
        provider: "postgres",
      }),
      log: ["error"],
    });
  });

  it("should configure production log levels when NODE_ENV is not development", async () => {
    // Set NODE_ENV to something other than development
    vi.stubEnv("NODE_ENV", "test");

    // Import the module after setting up mocks
    await import("@/lib/prisma");

    // Verify PrismaClient was instantiated with production log levels
    expect(PrismaClient).toHaveBeenCalledWith({
      adapter: expect.objectContaining({
        adapterName: "@prisma/adapter-pg",
        config: {
          connectionString:
            "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
        },
        externalPool: null,
        options: undefined,
        provider: "postgres",
      }),
      log: ["error"],
    });
  });

  it("should set global prisma client in non-production environments", async () => {
    // Set NODE_ENV to development (non-production)
    vi.stubEnv("NODE_ENV", "development");

    // Clear any existing global prisma
    delete (global as typeof globalThis & { prisma?: unknown }).prisma;

    // Import the module after setting up mocks
    const { prisma } = await import("@/lib/prisma");

    // Verify global prisma was set
    expect((global as unknown as { prisma: typeof prisma }).prisma).toBe(
      prisma,
    );
  });

  it("should not set global prisma client in production environment", async () => {
    // Set NODE_ENV to production
    vi.stubEnv("NODE_ENV", "production");

    // Clear any existing global prisma
    delete (global as typeof globalThis & { prisma?: unknown }).prisma;

    // Import the module after setting up mocks
    await import("@/lib/prisma");

    // Verify global prisma was not set
    expect(
      (global as typeof globalThis & { prisma?: unknown }).prisma,
    ).toBeUndefined();
  });

  it("should use the correct database URL from getDatabaseUrls", async () => {
    // Set up a custom database URL
    const customUrl = "postgresql://custom:custom@customhost:5433/customdb";
    mockGetDatabaseUrls.mockReturnValue({
      POSTGRES_PRISMA_URL: customUrl,
      POSTGRES_URL_NON_POOLING:
        "postgresql://custom:custom@customhost:5433/customdb",
    });

    // Import the module after setting up mocks
    await import("@/lib/prisma");

    // Verify PrismaClient was instantiated with the custom URL
    expect(PrismaClient).toHaveBeenCalledWith({
      adapter: expect.objectContaining({
        adapterName: "@prisma/adapter-pg",
        config: {
          connectionString: customUrl,
        },
        externalPool: null,
        options: undefined,
        provider: "postgres",
      }),
      log: ["error"],
    });
  });

  it("should handle global prisma object with prisma property", async () => {
    // Create a mock prisma client
    const mockPrismaClient = { $connect: vi.fn(), $disconnect: vi.fn() };

    // Set the global prisma client with the expected structure
    (global as unknown as { prisma: typeof mockPrismaClient }).prisma =
      mockPrismaClient;

    // Import the module after setting up mocks
    const { prisma } = await import("@/lib/prisma");

    // Verify the returned prisma instance is the global one
    expect(prisma).toBe(mockPrismaClient);

    // Verify PrismaClient was NOT instantiated again
    expect(PrismaClient).not.toHaveBeenCalled();
  });
});

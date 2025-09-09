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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDatabaseUrls } from "@/lib/env";

// Store original environment variables
const originalEnv = { ...process.env };

describe("getDatabaseUrls", () => {
  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("should use default values when no environment variables are set", () => {
    // Clear all relevant environment variables
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_DB;

    const result = getDatabaseUrls();

    expect(result).toEqual({
      POSTGRES_PRISMA_URL: "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
      POSTGRES_URL_NON_POOLING: "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
    });
  });

  it("should use environment variables when all are set", () => {
    // Set all environment variables
    process.env.POSTGRES_USER = "testuser";
    process.env.POSTGRES_PASSWORD = "testpass";
    process.env.POSTGRES_HOST = "testhost";
    process.env.POSTGRES_PORT = "5433";
    process.env.POSTGRES_DB = "testdb";

    const result = getDatabaseUrls();

    expect(result).toEqual({
      POSTGRES_PRISMA_URL: "postgresql://testuser:testpass@testhost:5433/testdb",
      POSTGRES_URL_NON_POOLING: "postgresql://testuser:testpass@testhost:5433/testdb",
    });
  });

  it("should use a mix of environment variables and defaults when some are set", () => {
    // Set only some environment variables
    process.env.POSTGRES_USER = "customuser";
    process.env.POSTGRES_PASSWORD = "custompass";
    // Leave POSTGRES_HOST, POSTGRES_PORT, and POSTGRES_DB as defaults

    const result = getDatabaseUrls();

    expect(result).toEqual({
      POSTGRES_PRISMA_URL: "postgresql://customuser:custompass@localhost:5432/kana_flashcard",
      POSTGRES_URL_NON_POOLING: "postgresql://customuser:custompass@localhost:5432/kana_flashcard",
    });
  });

  it("should handle empty string environment variables by using defaults", () => {
    // Set environment variables to empty strings
    process.env.POSTGRES_USER = "";
    process.env.POSTGRES_PASSWORD = "";
    process.env.POSTGRES_HOST = "";
    process.env.POSTGRES_PORT = "";
    process.env.POSTGRES_DB = "";

    const result = getDatabaseUrls();

    // Empty strings should trigger the default values
    expect(result).toEqual({
      POSTGRES_PRISMA_URL: "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
      POSTGRES_URL_NON_POOLING: "postgresql://postgres:postgres@localhost:5432/kana_flashcard",
    });
  });

  it("should return an object with the correct structure", () => {
    const result = getDatabaseUrls();

    expect(result).toHaveProperty("POSTGRES_PRISMA_URL");
    expect(result).toHaveProperty("POSTGRES_URL_NON_POOLING");
    expect(typeof result.POSTGRES_PRISMA_URL).toBe("string");
    expect(typeof result.POSTGRES_URL_NON_POOLING).toBe("string");
    expect(result.POSTGRES_PRISMA_URL).toBe(result.POSTGRES_URL_NON_POOLING);
  });

  it("should construct the PostgreSQL URL correctly with special characters in password", () => {
    process.env.POSTGRES_PASSWORD = "test@pass#123";

    const result = getDatabaseUrls();

    expect(result.POSTGRES_PRISMA_URL).toBe("postgresql://postgres:test@pass#123@localhost:5432/kana_flashcard");
    expect(result.POSTGRES_URL_NON_POOLING).toBe("postgresql://postgres:test@pass#123@localhost:5432/kana_flashcard");
  });
});
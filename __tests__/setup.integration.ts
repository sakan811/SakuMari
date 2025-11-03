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

import { vi } from "vitest";

// Set up integration test environment
process.env.NODE_ENV = "test";
process.env.CREDS_PROVIDER = "true";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
process.env.REDIS_PASSWORD = "";
process.env.REDIS_DB = "1";

// Global mock state for controllable Redis
let mockPipeline: any = {
  zremrangebyscore: vi.fn().mockReturnThis(),
  zadd: vi.fn().mockReturnThis(),
  zcard: vi.fn().mockReturnThis(),
  expire: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue([
    [null, 1], // zremrangebyscore result
    [null, 1], // zadd result
    [null, 1], // zcard result (current count)
    [null, 1], // expire result
  ]),
};

// Set up event handlers to simulate Redis behavior
let storedErrorHandler: Function | null = null;
let storedConnectHandler: Function | null = null;

const mockRedis = {
  pipeline: vi.fn(() => mockPipeline),
  on: vi.fn((event: string, handler: Function) => {
    if (event === "error") {
      // Store the error handler for manual triggering
      storedErrorHandler = handler;
    } else if (event === "connect") {
      // Store the connect handler for manual triggering
      storedConnectHandler = handler;
    }
  }),
  get: vi.fn(),
  set: vi.fn(),
  expire: vi.fn(),
  // Add connect method to simulate connection
  connect: vi.fn().mockResolvedValue(undefined),
};

// Export helper functions globally for tests
(global as any).setMockPipeline = (pipeline: any) => {
  mockPipeline = pipeline;
  mockRedis.pipeline = vi.fn(() => mockPipeline);
};

(global as any).setMockRedis = (redis: any) => {
  Object.assign(mockRedis, redis);
};

(global as any).getMockRedis = () => mockRedis;

(global as any).getErrorHandler = () => storedErrorHandler;
(global as any).getConnectHandler = () => storedConnectHandler;

// Mock Redis for integration tests
vi.mock("ioredis", () => {
  // Create a mock Redis constructor
  class MockRedis {
    constructor() {
      return mockRedis;
    }
  }

  return {
    default: MockRedis,
  };
});
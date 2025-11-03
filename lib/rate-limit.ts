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

import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Check if we're in a test environment
const isTestEnvironment = () => {
  return process.env.CREDS_PROVIDER === "true";
};

// Rate limit configuration for different endpoint types
const RATE_LIMITS = {
  // Health endpoint - public, very permissive
  health: { requests: 60, window: "60 s" },

  // Stats endpoint - authenticated, moderate usage
  stats: { requests: 30, window: "60 s" },

  // Flashcard submission - authenticated, higher frequency allowed
  flashcards: { requests: 100, window: "60 s" },

  // AI tips - authenticated, limited due to external API costs
  tips: { requests: 10, window: "60 s" },

  // Auth endpoints - public, strict limits to prevent brute force
  auth: { requests: 10, window: "60 s" },

  // Default rate limit for other endpoints
  default: { requests: 20, window: "60 s" },
} as const;

// More permissive rate limits for test environments
const TEST_RATE_LIMITS = {
  // Health endpoint - very permissive in tests
  health: { requests: 200, window: "60 s" },

  // Stats endpoint - very permissive in tests
  stats: { requests: 200, window: "60 s" },

  // Flashcard submission - very permissive in tests
  flashcards: { requests: 500, window: "60 s" },

  // AI tips - more permissive in tests (but still reasonable)
  tips: { requests: 50, window: "60 s" },

  // Auth endpoints - much more permissive in tests to avoid 429s
  auth: { requests: 100, window: "60 s" },

  // Default rate limit - very permissive in tests
  default: { requests: 200, window: "60 s" },
} as const;

type EndpointType = keyof typeof RATE_LIMITS;

// Create Redis client
let redis: Redis | null = null;

const getRedisClient = (): Redis => {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || "0"),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Handle connection errors gracefully
    redis.on("error", (error: Error) => {
      console.error("Redis connection error:", error);
    });

    redis.on("connect", () => {
      console.log("Connected to Redis");
    });
  }
  return redis;
};

// Custom sliding window rate limiter implementation
class SlidingWindowRateLimiter {
  private redis: Redis;
  private prefix: string;
  private requests: number;
  private window: number; // window in seconds

  constructor(redis: Redis, prefix: string, requests: number, window: string) {
    this.redis = redis;
    this.prefix = prefix;
    this.requests = requests;
    this.window = this.parseWindow(window);
  }

  private parseWindow(window: string): number {
    // Parse window strings like "60 s", "1 m", "1 h" into seconds
    const match = window.match(/^(\d+)\s*([smh])$/);
    if (!match) {
      throw new Error(`Invalid window format: ${window}`);
    }
    const [, value, unit] = match;
    const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 1;
    return parseInt(value) * multiplier;
  }

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - this.window;
    const key = `${this.prefix}:${identifier}`;

    try {
      // Use a pipeline for atomic operations
      const pipeline = this.redis.pipeline();

      // Remove expired entries
      pipeline.zremrangebyscore(key, '-inf', windowStart);

      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);

      // Count current requests in window
      pipeline.zcard(key);

      // Set expiration on the key
      pipeline.expire(key, this.window);

      const results = await pipeline.exec();

      if (!results) {
        throw new Error("Pipeline execution failed");
      }

      const currentCount = results[2][1] as number;
      const success = currentCount <= this.requests;
      const remaining = Math.max(0, this.requests - currentCount);
      const reset = now + this.window;

      return {
        success,
        limit: this.requests,
        remaining,
        reset: reset * 1000, // Convert to milliseconds
      };
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Fail open - allow request if rate limiting fails
      return {
        success: true,
        limit: this.requests,
        remaining: this.requests,
        reset: (now + this.window) * 1000,
      };
    }
  }
}

// Create rate limiters for different endpoint types
const createRateLimiter = (type: EndpointType) => {
  // Use test rate limits if we're in a test environment
  const rateLimits = isTestEnvironment() ? TEST_RATE_LIMITS : RATE_LIMITS;
  const config = rateLimits[type];
  const redisClient = getRedisClient();

  return new SlidingWindowRateLimiter(
    redisClient,
    `ratelimit:${isTestEnvironment() ? 'test:' : ''}${type}`,
    config.requests,
    config.window
  );
};

// Get client IP address from request
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-client-ip") ||
    "127.0.0.1"
  );
}

// Get user identifier for rate limiting
function getIdentifier(request: NextRequest, userId?: string): string {
  // For authenticated endpoints, use user ID for more precise limiting
  if (userId) {
    return `user:${userId}`;
  }

  // For public endpoints, use IP address
  const ip = getClientIP(request);
  return `ip:${ip}`;
}

// Rate limiting proxy function
export async function applyRateLimit(
  request: NextRequest,
  endpointType: EndpointType,
  userId?: string,
): Promise<{ success: boolean; response?: NextResponse }> {
  try {
    const ratelimit = createRateLimiter(endpointType);
    const identifier = getIdentifier(request, userId);

    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

    // Create headers for rate limit info
    const headers = new Headers({
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    });

    if (!success) {
      const response = NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Limit: ${limit} requests per ${(isTestEnvironment() ? TEST_RATE_LIMITS : RATE_LIMITS)[endpointType].window}.`,
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );

      // Add retry-after header for rate limit compliance
      response.headers.set("Retry-After", Math.ceil((reset - Date.now()) / 1000).toString());

      return { success: false, response };
    }

    return { success: true };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow request if rate limiting fails
    return { success: true };
  }
}

// Determine endpoint type from request pathname
export function getEndpointType(pathname: string): EndpointType {
  if (pathname.includes("/health")) return "health";
  if (pathname.includes("/stats")) return "stats";
  if (pathname.includes("/flashcards")) return "flashcards";
  if (pathname.includes("/tips")) return "tips";
  if (pathname.includes("/auth")) return "auth";
  return "default";
}
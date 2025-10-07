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
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

type EndpointType = keyof typeof RATE_LIMITS;

// Create Redis client
const redis = Redis.fromEnv();

// Create rate limiters for different endpoint types
const createRateLimiter = (type: EndpointType) => {
  const config = RATE_LIMITS[type];
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `@upstash/ratelimit:${type}`,
    analytics: false, // Set to true if you want analytics
  });
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

// Rate limiting middleware function
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
          message: `Too many requests. Limit: ${limit} requests per ${RATE_LIMITS[endpointType].window}.`,
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
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

import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(code && { code }),
    },
    { status },
  );
}

/**
 * Higher-order function that wraps API handlers with standardized error handling
 */
export function withErrorHandler<T = unknown>(
  handler: () => Promise<NextResponse<T>> | NextResponse<T>,
) {
  return async (): Promise<NextResponse<T>> => {
    try {
      return await handler();
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        return createErrorResponse(
          error.message,
          error.status,
          error.code,
        ) as NextResponse<T>;
      }

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes("Invalid JSON")) {
          return createErrorResponse(
            "Invalid request format",
            400,
            "INVALID_JSON",
          ) as NextResponse<T>;
        }

        if (error.message.includes("GEMINI_API_KEY")) {
          return createErrorResponse(
            "AI service not configured. Please contact support.",
            503,
            "AI_SERVICE_UNAVAILABLE",
          ) as NextResponse<T>;
        }
      }

      return createErrorResponse(
        "Internal server error",
        500,
        "INTERNAL_ERROR",
      ) as NextResponse<T>;
    }
  };
}

/**
 * Common API errors
 */
export const ApiErrors = {
  unauthorized: () => createErrorResponse("Unauthorized", 401, "UNAUTHORIZED"),
  badRequest: (message: string) =>
    createErrorResponse(message, 400, "BAD_REQUEST"),
  notFound: (resource?: string) =>
    createErrorResponse(
      resource ? `${resource} not found` : "Resource not found",
      404,
      "NOT_FOUND",
    ),
  internalError: (message?: string) =>
    createErrorResponse(
      message || "Internal server error",
      500,
      "INTERNAL_ERROR",
    ),
  serviceUnavailable: (message?: string) =>
    createErrorResponse(
      message || "Service temporarily unavailable",
      503,
      "SERVICE_UNAVAILABLE",
    ),
} as const;

/**
 * Validation helper for request bodies
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[],
): NextResponse | null {
  for (const field of fields) {
    if (!data[field]) {
      return ApiErrors.badRequest(`${field} is required`);
    }
  }
  return null;
}

/**
 * Validation helper for field types
 */
export function validateTypes(
  data: Record<string, unknown>,
  validators: Record<string, (value: unknown) => boolean>,
): NextResponse | null {
  for (const [field, validator] of Object.entries(validators)) {
    if (data[field] !== undefined && !validator(data[field])) {
      return ApiErrors.badRequest(`${field} has invalid type or value`);
    }
  }
  return null;
}

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
import { auth } from "@/lib/auth";

/**
 * Validates user authentication and returns the authenticated user ID
 * @returns Promise<string> - The authenticated user ID
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

/**
 * Creates a standardized error response for API routes
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Handles API authentication and returns user ID or error response
 * @returns Promise<{userId: string} | NextResponse>
 */
export async function handleAuth(): Promise<{ userId: string } | NextResponse> {
  try {
    const userId = await requireAuth();
    return { userId };
  } catch {
    return createErrorResponse("Unauthorized", 401);
  }
}

/**
 * Wraps API route handlers with standardized error handling
 * @param handler - The API route handler function
 * @param operation - Description of the operation for error logging
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  operation: string,
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`Error ${operation}:`, error);
      return createErrorResponse("Internal server error", 500);
    }
  };
}

/**
 * Validates JSON request body and returns parsed data
 * @param request - The request object
 * @returns Promise<any> - Parsed JSON data
 * @throws Error if JSON is invalid
 */
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON");
  }
}

/**
 * Validates required fields in request body
 * @param body - Request body object
 * @param requiredFields - Array of required field names
 * @throws Error if any required field is missing
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[],
): void {
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      throw new Error(`${field} is required`);
    }
  }
}

/**
 * Validates field types in request body
 * @param body - Request body object
 * @param fieldTypes - Object mapping field names to expected types
 * @throws Error if any field has wrong type
 */
export function validateFieldTypes(
  body: any,
  fieldTypes: Record<string, string>,
): void {
  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    if (body[field] !== undefined && typeof body[field] !== expectedType) {
      throw new Error(`${field} must be a ${expectedType}`);
    }
  }
}

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
import { auth } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
}

export interface AuthenticatedContext {
  userId: string;
}

type ApiHandler<T = unknown> = (
  request: NextRequest,
  context: AuthenticatedContext,
) => Promise<NextResponse<T>> | NextResponse<T>;

/**
 * Higher-order function that wraps API route handlers with authentication
 * Eliminates the need to duplicate auth checks across protected routes
 */
export function withAuth<T = unknown>(handler: ApiHandler<T>) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        ) as NextResponse<T>;
      }

      const context: AuthenticatedContext = {
        userId: session.user.id,
      };

      return handler(request, context);
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 },
      ) as NextResponse<T>;
    }
  };
}

/**
 * Alternative withAuth for handlers that don't need the request object
 */
export function withAuthSimple<T = unknown>(
  handler: (
    context: AuthenticatedContext,
  ) => Promise<NextResponse<T>> | NextResponse<T>,
) {
  return withAuth((_request: NextRequest, context: AuthenticatedContext) =>
    handler(context),
  );
}

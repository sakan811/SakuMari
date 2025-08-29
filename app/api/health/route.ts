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

/**
 * Health check API endpoint with database connectivity verification
 * Returns 200 OK with basic system status information
 */

import { NextResponse } from "next/server";
import {
  performHealthCheck,
  checkDatabaseConnection,
} from "@/lib/health-check";

export async function GET() {
  const healthStatus = await performHealthCheck();
  const statusCode = healthStatus.status === "healthy" ? 200 : 503;

  return NextResponse.json(healthStatus, { status: statusCode });
}

// Support HEAD requests for basic connectivity checks
export async function HEAD() {
  try {
    await checkDatabaseConnection();
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

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

import { prisma } from "@/lib/prisma";

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string | undefined;
  database: "connected" | "disconnected";
  version?: string;
  error?: string;
}

/**
 * Check database connectivity by executing a simple query
 * @returns Promise that resolves if database is connected, rejects if not
 */
export async function checkDatabaseConnection(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

/**
 * Create a complete health status object
 * @param isHealthy - Whether the system is healthy
 * @param error - Optional error message if unhealthy
 * @returns HealthStatus object
 */
export function createHealthStatus(
  isHealthy: boolean, 
  error?: Error | string
): HealthStatus {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  const environment = process.env.NODE_ENV;
  const version = process.env.npm_package_version || "1.0.0";

  if (isHealthy) {
    return {
      status: "healthy",
      timestamp,
      uptime,
      environment,
      database: "connected",
      version,
    };
  }

  return {
    status: "unhealthy",
    timestamp,
    uptime,
    environment,
    database: "disconnected",
    error: error instanceof Error ? error.message : String(error || "Unknown error"),
  };
}

/**
 * Perform a complete health check including database connectivity
 * @returns Promise<HealthStatus> - Complete health status
 */
export async function performHealthCheck(): Promise<HealthStatus> {
  try {
    await checkDatabaseConnection();
    return createHealthStatus(true);
  } catch (error) {
    console.error("Health check failed:", error);
    return createHealthStatus(false, error as Error);
  }
}
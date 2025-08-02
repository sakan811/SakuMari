/**
 * Health check API endpoint for Kubernetes liveness and readiness probes
 * Returns 200 OK with basic system status information
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: "connected",
      version: process.env.npm_package_version || "1.0.0",
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);

    const errorStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}

// Support HEAD requests for basic connectivity checks
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

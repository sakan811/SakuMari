import { describe, test, expect } from "vitest";
import { getTestPrisma } from "./setup";
import { Prisma } from "@prisma/client";

describe("Database Operations Safety", () => {
  test("should handle sequential progress updates safely", async () => {
    const prisma = await getTestPrisma();

    // Initial record
    await prisma.kanaProgress.create({
      data: {
        kana_id: "test-1",
        user_id: "test-user-1",
        attempts: 1,
        correct_attempts: 1,
        accuracy: 1.0,
      },
    });

    // Sequential updates (not concurrent for SQLite)
    for (let i = 0; i < 5; i++) {
      await prisma.kanaProgress.upsert({
        where: {
          kana_id_user_id: {
            kana_id: "test-1",
            user_id: "test-user-1",
          },
        },
        update: {
          attempts: { increment: 1 },
          correct_attempts: { increment: i % 2 },
        },
        create: {
          kana_id: "test-1",
          user_id: "test-user-1",
          attempts: 1,
          correct_attempts: 1,
          accuracy: 1.0,
        },
      });

      // Small delay between operations
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    const final = await prisma.kanaProgress.findUnique({
      where: {
        kana_id_user_id: {
          kana_id: "test-1",
          user_id: "test-user-1",
        },
      },
    });

    expect(final?.attempts).toBe(6); // 1 initial + 5 updates
    expect(final?.correct_attempts).toBeGreaterThanOrEqual(1);
  });

  test("should handle transaction rollback properly", async () => {
    const prisma = await getTestPrisma();

    await expect(async () => {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create valid progress
        await tx.kanaProgress.create({
          data: {
            kana_id: "test-2",
            user_id: "test-user-1",
            attempts: 1,
            correct_attempts: 1,
            accuracy: 1.0,
          },
        });

        // This should fail and rollback
        await tx.kanaProgress.create({
          data: {
            kana_id: "non-existent-kana",
            user_id: "test-user-1",
            attempts: 1,
            correct_attempts: 1,
            accuracy: 1.0,
          },
        });
      });
    }).rejects.toThrow();

    // Verify nothing was created
    const progress = await prisma.kanaProgress.findMany({
      where: {
        user_id: "test-user-1",
        kana_id: "test-2",
      },
    });

    expect(progress).toHaveLength(0);
  });
});

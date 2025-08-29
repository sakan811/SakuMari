import { describe, test, expect } from "vitest";
import { getTestPrisma } from "./setup";

describe("User Data Integration", () => {
  test("should retrieve user progress with kana data", async () => {
    const prisma = await getTestPrisma();

    // Create progress records
    await prisma.kanaProgress.createMany({
      data: [
        {
          kana_id: "test-1",
          user_id: "test-user-1",
          attempts: 5,
          correct_attempts: 4,
          accuracy: 0.8,
        },
        {
          kana_id: "test-2",
          user_id: "test-user-1",
          attempts: 3,
          correct_attempts: 3,
          accuracy: 1.0,
        },
      ],
    });

    // Query like the API does
    const kanaWithProgress = await prisma.kana.findMany({
      include: {
        progress: {
          where: {
            user_id: "test-user-1",
          },
          select: {
            attempts: true,
            correct_attempts: true,
            accuracy: true,
          },
        },
      },
    });

    expect(kanaWithProgress).toHaveLength(5); // All kana

    const progressKana = kanaWithProgress.filter(
      (k: { progress: any[] }) => k.progress.length > 0,
    );
    expect(progressKana).toHaveLength(2); // Only 2 have progress

    const firstProgress = progressKana[0].progress[0];
    expect([0.8, 1.0]).toContain(firstProgress.accuracy);
  });

  test("should handle user deletion cascade", async () => {
    const prisma = await getTestPrisma();

    // Create progress record
    await prisma.kanaProgress.create({
      data: {
        kana_id: "test-1",
        user_id: "test-user-1",
        attempts: 1,
        correct_attempts: 1,
        accuracy: 1.0,
      },
    });

    // Delete user (should cascade to progress)
    await prisma.user.delete({
      where: { id: "test-user-1" },
    });

    // Progress should be deleted
    const progress = await prisma.kanaProgress.findMany({
      where: { user_id: "test-user-1" },
    });

    expect(progress).toHaveLength(0);
  });

  test("should prevent kana deletion when progress exists", async () => {
    const prisma = await getTestPrisma();

    await prisma.kanaProgress.create({
      data: {
        kana_id: "test-1",
        user_id: "test-user-1",
        attempts: 1,
        correct_attempts: 1,
        accuracy: 1.0,
      },
    });

    // Should not be able to delete kana with progress (RESTRICT constraint)
    await expect(
      prisma.kana.delete({
        where: { id: "test-1" },
      }),
    ).rejects.toThrow();
  });
});

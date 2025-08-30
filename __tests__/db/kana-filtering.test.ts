import { describe, test, expect } from "vitest";
import { getTestPrisma } from "./setup";

describe("Kana Filtering Database Operations", () => {
  test("should filter hiragana characters correctly", async () => {
    const prisma = await getTestPrisma();
    const allKana = await prisma.kana.findMany();

    // Filter hiragana (Unicode range 0x3040-0x309F)
    const hiragana = allKana.filter((kana: { character: string }) => {
      const charCode = kana.character.charCodeAt(0);
      return charCode >= 0x3040 && charCode <= 0x309f;
    });

    expect(hiragana).toHaveLength(3); // あ, い, う
    expect(
      hiragana.every((k: { character: string }) =>
        ["あ", "い", "う"].includes(k.character),
      ),
    ).toBe(true);
  });

  test("should filter katakana characters correctly", async () => {
    const prisma = await getTestPrisma();
    const allKana = await prisma.kana.findMany();

    // Filter katakana (Unicode range 0x30A0-0x30FF)
    const katakana = allKana.filter((kana: { character: string }) => {
      const charCode = kana.character.charCodeAt(0);
      return charCode >= 0x30a0 && charCode <= 0x30ff;
    });

    expect(katakana).toHaveLength(2); // ア, イ
    expect(
      katakana.every((k: { character: string }) =>
        ["ア", "イ"].includes(k.character),
      ),
    ).toBe(true);
  });

  test("should retrieve kana with user-specific progress only", async () => {
    const prisma = await getTestPrisma();

    // Create second user
    await prisma.user.create({
      data: {
        id: "test-user-2",
        email: "test2@example.com",
        name: "Test User 2",
      },
    });

    // Create progress for both users
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
          kana_id: "test-1",
          user_id: "test-user-2",
          attempts: 3,
          correct_attempts: 1,
          accuracy: 0.33,
        },
      ],
    });

    // Query for user 1 only
    const user1Data = await prisma.kana.findMany({
      include: {
        progress: {
          where: { user_id: "test-user-1" },
          select: { accuracy: true },
        },
      },
    });

    const kanaWithProgress = user1Data.find(
      (k: { id: string }) => k.id === "test-1",
    );
    expect(kanaWithProgress?.progress).toHaveLength(1);
    expect(kanaWithProgress?.progress[0].accuracy).toBe(0.8);
  });
});

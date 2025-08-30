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

const { PrismaClient } = require("../generated/prisma_client");

const prisma = new PrismaClient();

const hiragana = [
  // Basic hiragana (46)
  { character: "あ", romaji: "a" },
  { character: "い", romaji: "i" },
  { character: "う", romaji: "u" },
  { character: "え", romaji: "e" },
  { character: "お", romaji: "o" },
  { character: "か", romaji: "ka" },
  { character: "き", romaji: "ki" },
  { character: "く", romaji: "ku" },
  { character: "け", romaji: "ke" },
  { character: "こ", romaji: "ko" },
  { character: "さ", romaji: "sa" },
  { character: "し", romaji: "shi" },
  { character: "す", romaji: "su" },
  { character: "せ", romaji: "se" },
  { character: "そ", romaji: "so" },
  { character: "た", romaji: "ta" },
  { character: "ち", romaji: "chi" },
  { character: "つ", romaji: "tsu" },
  { character: "て", romaji: "te" },
  { character: "と", romaji: "to" },
  { character: "な", romaji: "na" },
  { character: "に", romaji: "ni" },
  { character: "ぬ", romaji: "nu" },
  { character: "ね", romaji: "ne" },
  { character: "の", romaji: "no" },
  { character: "は", romaji: "ha" },
  { character: "ひ", romaji: "hi" },
  { character: "ふ", romaji: "fu" },
  { character: "へ", romaji: "he" },
  { character: "ほ", romaji: "ho" },
  { character: "ま", romaji: "ma" },
  { character: "み", romaji: "mi" },
  { character: "む", romaji: "mu" },
  { character: "め", romaji: "me" },
  { character: "も", romaji: "mo" },
  { character: "や", romaji: "ya" },
  { character: "ゆ", romaji: "yu" },
  { character: "よ", romaji: "yo" },
  { character: "ら", romaji: "ra" },
  { character: "り", romaji: "ri" },
  { character: "る", romaji: "ru" },
  { character: "れ", romaji: "re" },
  { character: "ろ", romaji: "ro" },
  { character: "わ", romaji: "wa" },
  { character: "を", romaji: "wo" },
  { character: "ん", romaji: "n" },

  // Dakuten and handakuten hiragana (25 additional)
  { character: "が", romaji: "ga" },
  { character: "ぎ", romaji: "gi" },
  { character: "ぐ", romaji: "gu" },
  { character: "げ", romaji: "ge" },
  { character: "ご", romaji: "go" },
  { character: "ざ", romaji: "za" },
  { character: "じ", romaji: "ji" },
  { character: "ず", romaji: "zu" },
  { character: "ぜ", romaji: "ze" },
  { character: "ぞ", romaji: "zo" },
  { character: "だ", romaji: "da" },
  { character: "ぢ", romaji: "ji" },
  { character: "づ", romaji: "zu" },
  { character: "で", romaji: "de" },
  { character: "ど", romaji: "do" },
  { character: "ば", romaji: "ba" },
  { character: "び", romaji: "bi" },
  { character: "ぶ", romaji: "bu" },
  { character: "べ", romaji: "be" },
  { character: "ぼ", romaji: "bo" },
  { character: "ぱ", romaji: "pa" },
  { character: "ぴ", romaji: "pi" },
  { character: "ぷ", romaji: "pu" },
  { character: "ぺ", romaji: "pe" },
  { character: "ぽ", romaji: "po" },
];

const katakana = [
  // Basic katakana (46)
  { character: "ア", romaji: "a" },
  { character: "イ", romaji: "i" },
  { character: "ウ", romaji: "u" },
  { character: "エ", romaji: "e" },
  { character: "オ", romaji: "o" },
  { character: "カ", romaji: "ka" },
  { character: "キ", romaji: "ki" },
  { character: "ク", romaji: "ku" },
  { character: "ケ", romaji: "ke" },
  { character: "コ", romaji: "ko" },
  { character: "サ", romaji: "sa" },
  { character: "シ", romaji: "shi" },
  { character: "ス", romaji: "su" },
  { character: "セ", romaji: "se" },
  { character: "ソ", romaji: "so" },
  { character: "タ", romaji: "ta" },
  { character: "チ", romaji: "chi" },
  { character: "ツ", romaji: "tsu" },
  { character: "テ", romaji: "te" },
  { character: "ト", romaji: "to" },
  { character: "ナ", romaji: "na" },
  { character: "ニ", romaji: "ni" },
  { character: "ヌ", romaji: "nu" },
  { character: "ネ", romaji: "ne" },
  { character: "ノ", romaji: "no" },
  { character: "ハ", romaji: "ha" },
  { character: "ヒ", romaji: "hi" },
  { character: "フ", romaji: "fu" },
  { character: "ヘ", romaji: "he" },
  { character: "ホ", romaji: "ho" },
  { character: "マ", romaji: "ma" },
  { character: "ミ", romaji: "mi" },
  { character: "ム", romaji: "mu" },
  { character: "メ", romaji: "me" },
  { character: "モ", romaji: "mo" },
  { character: "ヤ", romaji: "ya" },
  { character: "ユ", romaji: "yu" },
  { character: "ヨ", romaji: "yo" },
  { character: "ラ", romaji: "ra" },
  { character: "リ", romaji: "ri" },
  { character: "ル", romaji: "ru" },
  { character: "レ", romaji: "re" },
  { character: "ロ", romaji: "ro" },
  { character: "ワ", romaji: "wa" },
  { character: "ヲ", romaji: "wo" },
  { character: "ン", romaji: "n" },

  // Dakuten and handakuten katakana (25 additional)
  { character: "ガ", romaji: "ga" },
  { character: "ギ", romaji: "gi" },
  { character: "グ", romaji: "gu" },
  { character: "ゲ", romaji: "ge" },
  { character: "ゴ", romaji: "go" },
  { character: "ザ", romaji: "za" },
  { character: "ジ", romaji: "ji" },
  { character: "ズ", romaji: "zu" },
  { character: "ゼ", romaji: "ze" },
  { character: "ゾ", romaji: "zo" },
  { character: "ダ", romaji: "da" },
  { character: "ヂ", romaji: "ji" },
  { character: "ヅ", romaji: "zu" },
  { character: "デ", romaji: "de" },
  { character: "ド", romaji: "do" },
  { character: "バ", romaji: "ba" },
  { character: "ビ", romaji: "bi" },
  { character: "ブ", romaji: "bu" },
  { character: "ベ", romaji: "be" },
  { character: "ボ", romaji: "bo" },
  { character: "パ", romaji: "pa" },
  { character: "ピ", romaji: "pi" },
  { character: "プ", romaji: "pu" },
  { character: "ペ", romaji: "pe" },
  { character: "ポ", romaji: "po" },
];

async function seed() {
  console.log("Seeding database...");

  try {
    // Clear existing data without transaction (Supabase fix)
    console.log("Clearing existing data...");
    try {
      await prisma.kanaProgress.deleteMany({});
    } catch {
      console.log("KanaProgress table doesn't exist yet, skipping deletion");
    }

    try {
      await prisma.kana.deleteMany({});
    } catch {
      console.log("Kana table doesn't exist yet, skipping deletion");
    }

    // Add a small delay to ensure cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Seed hiragana
    console.log("Seeding hiragana...");
    await prisma.kana.createMany({
      data: hiragana,
      skipDuplicates: true,
    });

    // Seed katakana
    console.log("Seeding katakana...");
    await prisma.kana.createMany({
      data: katakana,
      skipDuplicates: true,
    });

    console.log("Seeding completed!");
    console.log(`Added ${hiragana.length + katakana.length} kana characters.`);

    // Create test user for e2e tests
    if (
      process.env.NODE_ENV === "test" ||
      process.env.CREDS_PROVIDER === "true"
    ) {
      console.log("Creating test user for e2e tests...");
      await prisma.user.upsert({
        where: { id: "test-user-e2e" },
        update: {},
        create: {
          id: "test-user-e2e",
          email: "test@sakumari.local",
          name: "Test User",
        },
      });
      console.log("Test user created!");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

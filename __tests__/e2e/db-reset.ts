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

import { PrismaClient } from "../../generated/prisma_client";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("Resetting database for E2E tests...");

  try {
    // Delete all data from tables
    await prisma.kanaProgress.deleteMany({});
    await prisma.kana.deleteMany({});

    // Recreate the test user
    await prisma.user.upsert({
      where: { id: "test-user-e2e" },
      update: {},
      create: {
        id: "test-user-e2e",
        email: "test@sakumari.local",
        name: "Test User",
      },
    });

    console.log("Database reset completed!");
  } catch (error) {
    console.error("Database reset failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  resetDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default resetDatabase;

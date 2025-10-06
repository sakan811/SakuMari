/*
  Warnings:

  - You are about to drop the column `access_token` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `session_state` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the `verificationtokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "access_token",
DROP COLUMN "expires_at",
DROP COLUMN "id_token",
DROP COLUMN "refresh_token",
DROP COLUMN "scope",
DROP COLUMN "session_state",
DROP COLUMN "token_type";

-- DropTable
DROP TABLE "public"."verificationtokens";

-- Enable Row Level Security on user-specific tables
ALTER TABLE "KanaProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for KanaProgress table
-- Note: Using application-level filtering for now, can be enhanced with session variables later
CREATE POLICY "Enable application-level filtering" ON "KanaProgress" FOR ALL USING (true);

-- Create RLS policies for sessions table
CREATE POLICY "Enable application-level filtering" ON "sessions" FOR SELECT USING (true);

-- Create RLS policies for accounts table
CREATE POLICY "Enable application-level filtering" ON "accounts" FOR SELECT USING (true);

-- Create RLS policies for users table
-- Public can create accounts (via auth), but users can only update their own
CREATE POLICY "Users can view all profiles" ON "users" FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (true);

-- Kana table remains public (no RLS) as it's reference data for all users

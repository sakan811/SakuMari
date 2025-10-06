-- Restore OAuth token fields to Account model for NextAuth.js v5 compatibility
-- Add VerificationToken table for email verification

-- Add OAuth token fields back to accounts table
ALTER TABLE "accounts"
ADD COLUMN "refresh_token" TEXT,
ADD COLUMN "access_token" TEXT,
ADD COLUMN "expires_at" INTEGER,
ADD COLUMN "token_type" TEXT,
ADD COLUMN "scope" TEXT,
ADD COLUMN "id_token" TEXT,
ADD COLUMN "session_state" TEXT;

-- Create verificationtokens table for NextAuth.js email verification
CREATE TABLE "verificationtokens" (
	"identifier" TEXT NOT NULL,
	"token" TEXT NOT NULL,
	"expires" TIMESTAMP(3) NOT NULL
);

-- Create unique constraint on verificationtokens
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- Add comments for documentation
COMMENT ON COLUMN "accounts"."refresh_token" IS 'OAuth refresh token for token renewal';
COMMENT ON COLUMN "accounts"."access_token" IS 'OAuth access token for API calls';
COMMENT ON COLUMN "accounts"."expires_at" IS 'OAuth token expiration timestamp';
COMMENT ON COLUMN "accounts"."token_type" IS 'OAuth token type (e.g., Bearer)';
COMMENT ON COLUMN "accounts"."scope" IS 'OAuth granted permissions scope';
COMMENT ON COLUMN "accounts"."id_token" IS 'OpenID Connect ID token';
COMMENT ON COLUMN "accounts"."session_state" IS 'OAuth session state for security';
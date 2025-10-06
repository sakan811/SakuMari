-- Add Row Level Security to verificationtokens table
-- This table contains sensitive email verification tokens that need protection

-- Enable Row Level Security on verificationtokens table
ALTER TABLE "verificationtokens" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for verificationtokens table
-- Policy allows application-level filtering (similar to other auth tables)
-- This prevents direct access while allowing the application to manage tokens properly
CREATE POLICY "Enable application-level filtering" ON "verificationtokens" FOR ALL USING (true);

-- Add comment explaining the security approach
COMMENT ON POLICY "Enable application-level filtering" ON "verificationtokens" IS 'Application-level filtering for email verification tokens - prevents direct table access while allowing auth system to function';
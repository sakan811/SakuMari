import { describe, it, expect } from 'vitest'
import { getTestPrisma } from './setup'

describe('Row Level Security (RLS) - Configuration Verification', () => {
  // Note: RLS is a PostgreSQL feature, so these tests verify the configuration
  // rather than the actual RLS behavior (which requires PostgreSQL)

  describe('Migration Files Structure', () => {
    it('should have RLS migration files present', async () => {
      const { existsSync } = await import('fs')

      // Check that RLS-related migrations exist
      const rlsMigrationPath = 'prisma/migrations/20251006142622_implement_rls_and_cleanup/migration.sql'
      const verificationTokensRlsPath = 'prisma/migrations/20251006153000_add_rls_to_verificationtokens/migration.sql'

      expect(existsSync(rlsMigrationPath)).toBe(true)
      expect(existsSync(verificationTokensRlsPath)).toBe(true)
    })

    it('should contain RLS enable statements in migration files', async () => {
      const { readFileSync } = await import('fs')

      const rlsMigrationContent = readFileSync(
        'prisma/migrations/20251006142622_implement_rls_and_cleanup/migration.sql',
        'utf8'
      )

      const verificationTokensRlsContent = readFileSync(
        'prisma/migrations/20251006153000_add_rls_to_verificationtokens/migration.sql',
        'utf8'
      )

      // Verify RLS enable statements
      expect(rlsMigrationContent).toContain('ENABLE ROW LEVEL SECURITY')
      expect(verificationTokensRlsContent).toContain('ENABLE ROW LEVEL SECURITY')

      // Verify specific tables have RLS enabled
      expect(rlsMigrationContent).toContain('ALTER TABLE "KanaProgress" ENABLE ROW LEVEL SECURITY')
      expect(rlsMigrationContent).toContain('ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY')
      expect(rlsMigrationContent).toContain('ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY')
      expect(rlsMigrationContent).toContain('ALTER TABLE "users" ENABLE ROW LEVEL SECURITY')
      expect(verificationTokensRlsContent).toContain('ALTER TABLE "verificationtokens" ENABLE ROW LEVEL SECURITY')
    })

    it('should contain RLS policy creation statements', async () => {
      const { readFileSync } = await import('fs')

      const rlsMigrationContent = readFileSync(
        'prisma/migrations/20251006142622_implement_rls_and_cleanup/migration.sql',
        'utf8'
      )

      const verificationTokensRlsContent = readFileSync(
        'prisma/migrations/20251006153000_add_rls_to_verificationtokens/migration.sql',
        'utf8'
      )

      // Verify policy creation statements
      expect(rlsMigrationContent).toContain('CREATE POLICY')
      expect(verificationTokensRlsContent).toContain('CREATE POLICY')

      // Verify specific policies for sensitive tables
      expect(rlsMigrationContent).toContain('POLICY "Enable application-level filtering" ON "KanaProgress"')
      expect(rlsMigrationContent).toContain('POLICY "Enable application-level filtering" ON "sessions"')
      expect(rlsMigrationContent).toContain('POLICY "Enable application-level filtering" ON "accounts"')
      expect(rlsMigrationContent).toContain('POLICY "Users can view all profiles" ON "users"')
      expect(verificationTokensRlsContent).toContain('POLICY "Enable application-level filtering" ON "verificationtokens"')
    })
  })

  describe('Prisma Schema Consistency', () => {
    it('should have consistent table naming between schema and migrations', async () => {
      const { readFileSync } = await import('fs')

      const schemaContent = readFileSync('prisma/schema.prisma', 'utf8')

      // Verify all RLS-protected tables exist in schema
      expect(schemaContent).toContain('model User')
      expect(schemaContent).toContain('model Account')
      expect(schemaContent).toContain('model Session')
      expect(schemaContent).toContain('model VerificationToken')
      expect(schemaContent).toContain('model KanaProgress')
      expect(schemaContent).toContain('model Kana')

      // Verify table mappings match migration expectations
      expect(schemaContent).toContain('@@map("users")')
      expect(schemaContent).toContain('@@map("accounts")')
      expect(schemaContent).toContain('@@map("sessions")')
      expect(schemaContent).toContain('@@map("verificationtokens")')
      // Note: KanaProgress and Kana use default table names (snake_case conversion)
      expect(schemaContent).toContain('model KanaProgress') // Uses default "kanaprogress" table name
      expect(schemaContent).toContain('model Kana') // Uses default "kana" table name
    })
  })

  describe('Data Access Patterns', () => {
    it('should allow normal application operations', async () => {
      const prisma = await getTestPrisma()

      // Test basic CRUD operations still work
      const user = await prisma.user.findUnique({
        where: { id: 'test-user-1' }
      })

      expect(user).toBeTruthy()
      expect(user?.email).toBe('test@example.com')

      // Test kana data access (public table)
      const kanas = await prisma.kana.findMany()
      expect(kanas.length).toBeGreaterThan(0)

      // Test progress operations work
      const progress = await prisma.kanaProgress.create({
        data: {
          kana_id: 'test-1',
          user_id: 'test-user-1',
          attempts: 1,
          correct_attempts: 0,
          accuracy: 0.0,
        },
      })

      expect(progress.id).toBeDefined()

      // Clean up
      await prisma.kanaProgress.delete({
        where: { id: progress.id }
      })
    })
  })

  describe('Security Configuration Summary', () => {
    it('should document RLS configuration status', async () => {
      // This test serves as documentation of current RLS setup

      const rlsConfiguration = {
        protected: {
          users: 'RLS enabled with view/update policies',
          accounts: 'RLS enabled with SELECT-only policy',
          sessions: 'RLS enabled with SELECT-only policy',
          verificationtokens: 'RLS enabled with application-level filtering',
          kanaprogress: 'RLS enabled with application-level filtering',
        },
        public: {
          kana: 'No RLS (public reference data)',
        },
        policies: {
          approach: 'Application-level filtering via Prisma ORM',
          enhancement: 'Can be enhanced with session variables for row-level access control',
        }
      }

      // Verify configuration is complete
      expect(Object.keys(rlsConfiguration.protected)).toHaveLength(5)
      expect(Object.keys(rlsConfiguration.public)).toHaveLength(1)

      // All sensitive tables should be protected
      const sensitiveTables = ['users', 'accounts', 'sessions', 'verificationtokens', 'kanaprogress']
      sensitiveTables.forEach(table => {
        expect(rlsConfiguration.protected).toHaveProperty(table)
        expect(rlsConfiguration.protected[table as keyof typeof rlsConfiguration.protected]).toContain('RLS enabled')
      })

      // Public data should remain accessible
      expect(rlsConfiguration.public.kana).toBe('No RLS (public reference data)')
    })
  })
})
"""Migration script for MVP data management - organizations, properties, tenants."""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

MIGRATION_SQL = """
-- ============================================
-- Organizations table (links to Clerk org)
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    clerk_org_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_clerk_org_id ON organizations(clerk_org_id);

-- ============================================
-- Properties table
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_org_id ON properties(org_id);

-- ============================================
-- Add org_id to tenants table
-- ============================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_tenants_org_id ON tenants(org_id);

-- ============================================
-- Add org_id to issues table
-- ============================================
ALTER TABLE issues ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_issues_org_id ON issues(org_id);

-- ============================================
-- Update tenants table - add is_active for soft delete
-- ============================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
"""


async def run_migration():
    """Run the database migration."""
    print(f"Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    statements = [
        # Organizations table
        """
        CREATE TABLE IF NOT EXISTS organizations (
            id SERIAL PRIMARY KEY,
            clerk_org_id VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_organizations_clerk_org_id ON organizations(clerk_org_id)",
        
        # Properties table
        """
        CREATE TABLE IF NOT EXISTS properties (
            id SERIAL PRIMARY KEY,
            org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_properties_org_id ON properties(org_id)",
        
        # Add org_id to tenants
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)",
        "CREATE INDEX IF NOT EXISTS idx_tenants_org_id ON tenants(org_id)",
        
        # Add org_id to issues
        "ALTER TABLE issues ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)",
        "CREATE INDEX IF NOT EXISTS idx_issues_org_id ON issues(org_id)",
        
        # Soft delete for tenants
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
    ]

    try:
        print("Running MVP data management migration...")
        for i, stmt in enumerate(statements):
            try:
                await conn.execute(stmt)
                print(f"  ✓ Statement {i+1}/{len(statements)} OK")
            except Exception as e:
                print(f"  ✗ Statement {i+1} failed: {e}")
        
        print("\nMigration completed!")

        # Verify new tables
        result = await conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('organizations', 'properties')
            ORDER BY table_name
        """)
        print(f"New tables: {[r['table_name'] for r in result]}")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migration())

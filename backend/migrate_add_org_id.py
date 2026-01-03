"""Migration to add org_id column to existing properties table."""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


async def run_migration():
    """Add org_id column to properties table."""
    print(f"Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    statements = [
        # First, create organizations table if it doesn't exist
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

        # Add org_id column to properties table
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE",
        "CREATE INDEX IF NOT EXISTS idx_properties_org_id ON properties(org_id)",

        # Add org_id to tenants table
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)",
        "CREATE INDEX IF NOT EXISTS idx_tenants_org_id ON tenants(org_id)",

        # Add org_id to issues table
        "ALTER TABLE issues ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id)",
        "CREATE INDEX IF NOT EXISTS idx_issues_org_id ON issues(org_id)",

        # Add is_active to tenants for soft delete
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
    ]

    try:
        print("Adding org_id columns to existing tables...")
        for i, stmt in enumerate(statements):
            try:
                await conn.execute(stmt)
                print(f"  [OK] Statement {i+1}/{len(statements)}")
            except Exception as e:
                print(f"  [WARN] Statement {i+1}: {e}")

        print("\nMigration completed!")

        # Verify columns exist
        result = await conn.fetch("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'properties'
            AND column_name = 'org_id'
        """)
        if result:
            print("[OK] properties.org_id column exists")
        else:
            print("[FAIL] properties.org_id column NOT found")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migration())

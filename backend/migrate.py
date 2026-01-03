"""Database migration script for FixMate."""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

MIGRATION_SQL = """
-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('tenant', 'property_manager', 'landlord');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_status AS ENUM (
        'new',
        'triaging',
        'resolved_by_agent',
        'escalated',
        'assigned',
        'in_progress',
        'awaiting_confirmation',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    property_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    property_id INTEGER,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status issue_status DEFAULT 'new',
    priority issue_priority DEFAULT 'medium',
    assigned_to VARCHAR(255),
    resolved_by_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issue messages table
CREATE TABLE IF NOT EXISTS issue_messages (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent activity log
CREATE TABLE IF NOT EXISTS agent_activity (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    would_notify VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_issues_tenant_id ON issues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issue_messages_issue_id ON issue_messages(issue_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_issue_id ON agent_activity(issue_id);

-- Insert a test tenant if not exists
INSERT INTO tenants (name, email, phone)
SELECT 'Test Tenant', 'tenant@example.com', '+447123456789'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE email = 'tenant@example.com');
"""

async def run_migration():
    """Run the database migration."""
    print(f"Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        print("Running migration...")
        await conn.execute(MIGRATION_SQL)
        print("Migration completed successfully!")

        # Verify tables
        result = await conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('tenants', 'issues', 'issue_messages', 'agent_activity')
            ORDER BY table_name
        """)
        print(f"Tables created: {[r['table_name'] for r in result]}")

        # Check tenant
        tenant = await conn.fetchrow("SELECT * FROM tenants LIMIT 1")
        if tenant:
            print(f"Test tenant exists: {tenant['name']} ({tenant['email']})")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migration())

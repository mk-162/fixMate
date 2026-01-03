"""Run WhatsApp tables migration."""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

MIGRATION_SQL = """
-- WhatsApp conversations table
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id SERIAL PRIMARY KEY,
    contact_id VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    tenant_id INTEGER REFERENCES tenants(id),
    issue_id INTEGER REFERENCES issues(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by contact_id
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_contact_id
ON whatsapp_conversations(contact_id);

-- Pending registrations for unknown phone numbers
CREATE TABLE IF NOT EXISTS whatsapp_pending_registrations (
    id SERIAL PRIMARY KEY,
    contact_id VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    initial_message TEXT,
    tenant_id INTEGER REFERENCES tenants(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

async def run():
    print("Connecting to database...")
    conn = await asyncpg.connect(os.getenv('DATABASE_URL'))

    print("Creating WhatsApp tables...")
    await conn.execute(MIGRATION_SQL)

    # Add phone column to tenants if missing
    try:
        await conn.execute("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone VARCHAR(50)")
        print("Added phone column to tenants")
    except Exception as e:
        print(f"Phone column: {e}")

    await conn.close()
    print("WhatsApp migration complete!")

if __name__ == "__main__":
    asyncio.run(run())

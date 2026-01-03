-- WhatsApp Integration Tables
-- Tracks conversations between Respond.io contacts and FixMate issues

-- WhatsApp conversations table
-- Links Respond.io contacts to tenants and issues
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id SERIAL PRIMARY KEY,
    contact_id VARCHAR(255) NOT NULL,  -- Respond.io contact ID
    phone VARCHAR(50),                   -- Phone number in E.164 format
    tenant_id INTEGER REFERENCES tenants(id),
    issue_id INTEGER REFERENCES issues(id),
    status VARCHAR(20) DEFAULT 'active', -- active, closed, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by contact_id
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_contact_id
ON whatsapp_conversations(contact_id);

-- Index for finding active conversations
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_active
ON whatsapp_conversations(contact_id, status)
WHERE status = 'active';

-- Index for finding conversations by issue
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_issue_id
ON whatsapp_conversations(issue_id);

-- Pending registrations for unknown phone numbers
CREATE TABLE IF NOT EXISTS whatsapp_pending_registrations (
    id SERIAL PRIMARY KEY,
    contact_id VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    initial_message TEXT,
    tenant_id INTEGER REFERENCES tenants(id),  -- Set when registration is complete
    status VARCHAR(20) DEFAULT 'pending',       -- pending, completed, expired
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up pending registrations
CREATE INDEX IF NOT EXISTS idx_whatsapp_pending_registrations_contact
ON whatsapp_pending_registrations(contact_id, status)
WHERE status = 'pending';

-- Add phone column to tenants if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'phone'
    ) THEN
        ALTER TABLE tenants ADD COLUMN phone VARCHAR(50);
    END IF;
END $$;

-- Index for tenant phone lookups
CREATE INDEX IF NOT EXISTS idx_tenants_phone
ON tenants(phone)
WHERE phone IS NOT NULL;

-- Message source tracking (add to existing messages table)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'issue_messages' AND column_name = 'source'
    ) THEN
        ALTER TABLE issue_messages ADD COLUMN source VARCHAR(20) DEFAULT 'web';
    END IF;
END $$;

COMMENT ON TABLE whatsapp_conversations IS 'Links Respond.io WhatsApp contacts to FixMate issues and tenants';
COMMENT ON TABLE whatsapp_pending_registrations IS 'Tracks unregistered WhatsApp contacts awaiting tenant setup';

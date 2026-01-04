-- Migration: Contractors Directory
-- Adds contractors table and contractor_assignments for tradesperson management

-- ============================================
-- NEW ENUM: CONTRACTOR TRADE
-- ============================================

DO $$ BEGIN
    CREATE TYPE "contractor_trade" AS ENUM(
        'plumbing',
        'electrical',
        'heating',
        'appliance',
        'locksmith',
        'carpentry',
        'roofing',
        'glazing',
        'cleaning',
        'gardening',
        'pest_control',
        'general',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CREATE CONTRACTORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contractors (
    id SERIAL PRIMARY KEY,
    organization_id TEXT NOT NULL,
    -- Basic info
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    -- Trade/specialty
    trade contractor_trade NOT NULL,
    -- Business details
    hourly_rate INTEGER, -- In pence
    notes TEXT,
    -- Status
    is_active INTEGER DEFAULT 1,
    -- Timestamps
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS contractors_organization_id_idx ON contractors(organization_id);
CREATE INDEX IF NOT EXISTS contractors_trade_idx ON contractors(trade);

-- ============================================
-- CREATE CONTRACTOR ASSIGNMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contractor_assignments (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER NOT NULL REFERENCES issues(id),
    contractor_id INTEGER NOT NULL REFERENCES contractors(id),
    -- Assignment details
    assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
    scheduled_for TIMESTAMP,
    completed_at TIMESTAMP,
    -- Cost tracking
    notes TEXT,
    quoted_amount INTEGER, -- In pence
    actual_amount INTEGER, -- In pence
    -- Timestamps
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS contractor_assignments_issue_id_idx ON contractor_assignments(issue_id);
CREATE INDEX IF NOT EXISTS contractor_assignments_contractor_id_idx ON contractor_assignments(contractor_id);

"""Migration for HMO Student Lets Schema."""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

MIGRATION_SQL = """
-- Migration: HMO Student Lets Schema
-- Adds rooms table, enhances properties and tenants for student HMO management

-- ============================================
-- NEW ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE "property_type" AS ENUM('hmo', 'single_let', 'studio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "epc_rating" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "council_tax_band" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "heating_type" AS ENUM('gas', 'electric', 'oil', 'heat_pump', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "room_status" AS ENUM('available', 'occupied', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "deposit_scheme" AS ENUM('DPS', 'TDS', 'MyDeposits');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "document_type" AS ENUM('gas_cert', 'eicr', 'epc', 'hmo_license', 'inventory', 'contract', 'deposit_cert', 'photo', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
"""

PROPERTIES_SQL = """
-- ============================================
-- ENHANCE PROPERTIES TABLE
-- ============================================

ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type property_type DEFAULT 'hmo';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS license_expiry TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS epc_rating epc_rating;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS epc_expiry TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS gas_cert_expiry TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS electrical_cert_expiry TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS council_tax_band council_tax_band;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS heating_type heating_type;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnished INTEGER DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_parking INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_garden INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS wifi_included INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bills_included INTEGER DEFAULT 0;
"""

ROOMS_SQL = """
-- ============================================
-- CREATE ROOMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id),
    room_name TEXT NOT NULL,
    floor INTEGER DEFAULT 0,
    size_sqm INTEGER,
    monthly_rent INTEGER NOT NULL,
    deposit_amount INTEGER,
    has_ensuite INTEGER DEFAULT 0,
    furnished INTEGER DEFAULT 1,
    status room_status NOT NULL DEFAULT 'available',
    notes TEXT,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS rooms_property_id_idx ON rooms(property_id);
CREATE INDEX IF NOT EXISTS rooms_status_idx ON rooms(status);
"""

TENANTS_SQL = """
-- ============================================
-- ENHANCE TENANTS TABLE
-- ============================================

-- Add room reference
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES rooms(id);

-- Lease details
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS lease_start TIMESTAMP;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS lease_end TIMESTAMP;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS rent_amount INTEGER;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_amount INTEGER;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_scheme deposit_scheme;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_reference TEXT;

-- Emergency contact
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT;

-- Guarantor
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS guarantor_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS guarantor_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS guarantor_phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS guarantor_address TEXT;

-- Student info
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS year_of_study INTEGER;

-- Notes (is_active may already exist from previous migration)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS tenants_room_id_idx ON tenants(room_id);
"""

DOCUMENTS_SQL = """
-- ============================================
-- CREATE DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    room_id INTEGER REFERENCES rooms(id),
    tenant_id INTEGER REFERENCES tenants(id),
    type document_type NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT,
    expiry_date TIMESTAMP,
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS documents_property_id_idx ON documents(property_id);
CREATE INDEX IF NOT EXISTS documents_room_id_idx ON documents(room_id);
CREATE INDEX IF NOT EXISTS documents_tenant_id_idx ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(type);
"""

ISSUES_SQL = """
-- ============================================
-- ADD ROOM REFERENCE TO ISSUES
-- ============================================

ALTER TABLE issues ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES rooms(id);
CREATE INDEX IF NOT EXISTS issues_room_id_idx ON issues(room_id);
"""

async def migrate():
    """Run HMO schema migration."""
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        print("Creating enums...")
        await conn.execute(MIGRATION_SQL)
        print("[OK] Enums created")

        print("Enhancing properties table...")
        await conn.execute(PROPERTIES_SQL)
        print("[OK] Properties table enhanced")

        print("Creating rooms table...")
        await conn.execute(ROOMS_SQL)
        print("[OK] Rooms table created")

        print("Enhancing tenants table...")
        await conn.execute(TENANTS_SQL)
        print("[OK] Tenants table enhanced")

        print("Creating documents table...")
        await conn.execute(DOCUMENTS_SQL)
        print("[OK] Documents table created")

        print("Adding room reference to issues...")
        await conn.execute(ISSUES_SQL)
        print("[OK] Issues table enhanced")

        # Verify tables exist
        tables = await conn.fetch("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('rooms', 'documents')
        """)
        print(f"\nVerified tables: {[t['table_name'] for t in tables]}")

        # Count columns in properties
        cols = await conn.fetch("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'properties'
        """)
        print(f"Properties table now has {len(cols)} columns")

        # Count columns in tenants
        cols = await conn.fetch("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'tenants'
        """)
        print(f"Tenants table now has {len(cols)} columns")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
    print("\n[SUCCESS] HMO Schema Migration Complete!")

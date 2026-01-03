"""Migration to add pm_notes column to issues table."""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    """Add pm_notes column to issues table."""
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Add pm_notes column if it doesn't exist
        await conn.execute("""
            ALTER TABLE issues
            ADD COLUMN IF NOT EXISTS pm_notes TEXT;
        """)
        print("Added pm_notes column to issues table")

        # Verify column exists
        result = await conn.fetchrow("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'issues' AND column_name = 'pm_notes'
        """)
        if result:
            print(f"Verified: {result['column_name']} ({result['data_type']})")
        else:
            print("Warning: Column was not created")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
    print("Migration complete!")

"""Database connection and session management."""
import asyncpg
from contextlib import asynccontextmanager
from app.config import DATABASE_URL


async def get_connection():
    """Get a database connection."""
    return await asyncpg.connect(DATABASE_URL)


@asynccontextmanager
async def get_db():
    """Context manager for database connections."""
    conn = await get_connection()
    try:
        yield conn
    finally:
        await conn.close()


# Simple query helpers
async def fetch_one(query: str, *args):
    """Fetch a single row."""
    async with get_db() as conn:
        return await conn.fetchrow(query, *args)


async def fetch_all(query: str, *args):
    """Fetch all rows."""
    async with get_db() as conn:
        return await conn.fetch(query, *args)


async def execute(query: str, *args):
    """Execute a query."""
    async with get_db() as conn:
        return await conn.execute(query, *args)


async def execute_returning(query: str, *args):
    """Execute a query and return the result."""
    async with get_db() as conn:
        return await conn.fetchrow(query, *args)

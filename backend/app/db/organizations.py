"""Database operations for organizations."""
from typing import Optional, Dict, Any
from app.db.database import fetch_one, fetch_all, execute_returning


class Organizations:
    """CRUD operations for organizations."""

    async def get_by_clerk_id(self, clerk_org_id: str) -> Optional[Dict[str, Any]]:
        """Get organization by Clerk org ID."""
        query = """
            SELECT * FROM organizations
            WHERE clerk_org_id = $1
        """
        row = await fetch_one(query, clerk_org_id)
        return dict(row) if row else None

    async def create(self, clerk_org_id: str, name: str) -> Dict[str, Any]:
        """Create a new organization."""
        query = """
            INSERT INTO organizations (clerk_org_id, name, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            RETURNING *
        """
        row = await execute_returning(query, clerk_org_id, name)
        return dict(row)

    async def get_or_create(self, clerk_org_id: str, name: str) -> Dict[str, Any]:
        """Get existing org or create new one."""
        existing = await self.get_by_clerk_id(clerk_org_id)
        if existing:
            return existing
        return await self.create(clerk_org_id, name)

    async def get_by_id(self, org_id: int) -> Optional[Dict[str, Any]]:
        """Get organization by internal ID."""
        query = "SELECT * FROM organizations WHERE id = $1"
        row = await fetch_one(query, org_id)
        return dict(row) if row else None


# Singleton instance
organizations = Organizations()

"""Database operations for properties."""
from typing import Optional, Dict, Any, List
from app.db.database import fetch_one, fetch_all, execute_returning, execute


class Properties:
    """CRUD operations for properties."""

    async def create(
        self,
        org_id: int,
        name: str,
        address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new property."""
        query = """
            INSERT INTO properties (org_id, name, address, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        """
        row = await execute_returning(query, org_id, name, address)
        return dict(row)

    async def get_by_id(self, property_id: int) -> Optional[Dict[str, Any]]:
        """Get property by ID."""
        query = "SELECT * FROM properties WHERE id = $1"
        row = await fetch_one(query, property_id)
        return dict(row) if row else None

    async def get_by_org(self, org_id: int, clerk_org_id: str = None) -> List[Dict[str, Any]]:
        """Get all properties for an organization.

        Supports both:
        - org_id (integer FK to organizations table) - Railway model
        - owner_id (Clerk org ID string) - Drizzle model
        """
        query = """
            SELECT p.*,
                   COALESCE((SELECT COUNT(*) FROM tenants t WHERE t.property_id = p.id AND (t.is_active = TRUE OR t.is_active IS NULL)), 0) as tenant_count,
                   COALESCE((SELECT COUNT(*) FROM issues i WHERE i.property_id = p.id AND i.status NOT IN ('closed', 'resolved_by_agent')), 0) as active_issue_count
            FROM properties p
            WHERE p.org_id = $1 OR p.owner_id = $2
            ORDER BY p.name
        """
        rows = await fetch_all(query, org_id, clerk_org_id)
        return [dict(row) for row in rows]

    async def update(
        self,
        property_id: int,
        name: Optional[str] = None,
        address: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Update a property."""
        # Build dynamic update query
        updates = []
        params = []
        param_count = 0
        
        if name is not None:
            param_count += 1
            updates.append(f"name = ${param_count}")
            params.append(name)
        
        if address is not None:
            param_count += 1
            updates.append(f"address = ${param_count}")
            params.append(address)
        
        if not updates:
            return await self.get_by_id(property_id)
        
        param_count += 1
        updates.append("updated_at = NOW()")
        params.append(property_id)
        
        query = f"""
            UPDATE properties
            SET {', '.join(updates)}
            WHERE id = ${param_count}
            RETURNING *
        """
        row = await execute_returning(query, *params)
        return dict(row) if row else None

    async def delete(self, property_id: int) -> bool:
        """Delete a property (cascade deletes tenants and issues)."""
        query = "DELETE FROM properties WHERE id = $1"
        await execute(query, property_id)
        return True


# Singleton instance
properties = Properties()

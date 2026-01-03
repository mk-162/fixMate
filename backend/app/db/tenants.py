"""Database operations for tenants."""
import re
from typing import Optional, Dict, Any, List
from app.db.database import fetch_one, fetch_all, execute_returning, execute


def normalize_phone(phone: str) -> str:
    """
    Normalize phone number to E.164 format.
    Examples:
        07123456789 -> +447123456789
        +44 7123 456789 -> +447123456789
        00447123456789 -> +447123456789
    """
    if not phone:
        return phone
    
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # Handle UK numbers without country code
    if cleaned.startswith('0') and len(cleaned) == 11:
        cleaned = '+44' + cleaned[1:]
    # Handle 00 international prefix
    elif cleaned.startswith('00'):
        cleaned = '+' + cleaned[2:]
    # Add + if missing and starts with country code
    elif not cleaned.startswith('+') and len(cleaned) > 10:
        cleaned = '+' + cleaned
    
    return cleaned


class Tenants:
    """CRUD operations for tenants."""

    async def create(
        self,
        org_id: int,
        name: str,
        property_id: Optional[int] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new tenant."""
        normalized_phone = normalize_phone(phone) if phone else None
        
        query = """
            INSERT INTO tenants (org_id, name, property_id, email, phone, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())
            RETURNING *
        """
        row = await execute_returning(query, org_id, name, property_id, email, normalized_phone)
        return dict(row)

    async def get_by_id(self, tenant_id: int) -> Optional[Dict[str, Any]]:
        """Get tenant by ID."""
        query = """
            SELECT t.*, p.name as property_name, p.address as property_address
            FROM tenants t
            LEFT JOIN properties p ON p.id = t.property_id
            WHERE t.id = $1
        """
        row = await fetch_one(query, tenant_id)
        return dict(row) if row else None

    async def get_by_org(self, org_id: int, include_inactive: bool = False) -> List[Dict[str, Any]]:
        """Get all tenants for an organization."""
        if include_inactive:
            query = """
                SELECT t.*, p.name as property_name, p.address as property_address
                FROM tenants t
                LEFT JOIN properties p ON p.id = t.property_id
                WHERE t.org_id = $1
                ORDER BY t.name
            """
        else:
            query = """
                SELECT t.*, p.name as property_name, p.address as property_address
                FROM tenants t
                LEFT JOIN properties p ON p.id = t.property_id
                WHERE t.org_id = $1 AND t.is_active = TRUE
                ORDER BY t.name
            """
        rows = await fetch_all(query, org_id)
        return [dict(row) for row in rows]

    async def get_by_property(self, property_id: int) -> List[Dict[str, Any]]:
        """Get all tenants for a property."""
        query = """
            SELECT * FROM tenants
            WHERE property_id = $1 AND is_active = TRUE
            ORDER BY name
        """
        rows = await fetch_all(query, property_id)
        return [dict(row) for row in rows]

    async def update(
        self,
        tenant_id: int,
        name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        property_id: Optional[int] = None,
    ) -> Optional[Dict[str, Any]]:
        """Update a tenant."""
        updates = []
        params = []
        param_count = 0
        
        if name is not None:
            param_count += 1
            updates.append(f"name = ${param_count}")
            params.append(name)
        
        if email is not None:
            param_count += 1
            updates.append(f"email = ${param_count}")
            params.append(email)
        
        if phone is not None:
            param_count += 1
            updates.append(f"phone = ${param_count}")
            params.append(normalize_phone(phone))
        
        if property_id is not None:
            param_count += 1
            updates.append(f"property_id = ${param_count}")
            params.append(property_id)
        
        if not updates:
            return await self.get_by_id(tenant_id)
        
        param_count += 1
        updates.append("updated_at = NOW()")
        params.append(tenant_id)
        
        query = f"""
            UPDATE tenants
            SET {', '.join(updates)}
            WHERE id = ${param_count}
            RETURNING *
        """
        row = await execute_returning(query, *params)
        return dict(row) if row else None

    async def soft_delete(self, tenant_id: int) -> bool:
        """Soft delete a tenant (keep for history)."""
        query = """
            UPDATE tenants
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = $1
        """
        await execute(query, tenant_id)
        return True


# Singleton instance
tenants = Tenants()

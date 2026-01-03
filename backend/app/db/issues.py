"""Issue database operations."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.db.database import fetch_one, fetch_all, execute_returning, execute


async def create_issue(
    tenant_id: int,
    property_id: int,
    title: str,
    description: str,
    category: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a new issue."""
    query = """
        INSERT INTO issues (tenant_id, property_id, title, description, category, status, priority)
        VALUES ($1, $2, $3, $4, $5, 'new', 'medium')
        RETURNING *
    """
    row = await execute_returning(query, tenant_id, property_id, title, description, category)
    return dict(row)


async def get_issue(issue_id: int) -> Optional[Dict[str, Any]]:
    """Get an issue by ID."""
    query = "SELECT * FROM issues WHERE id = $1"
    row = await fetch_one(query, issue_id)
    return dict(row) if row else None


async def get_issues_by_property(property_id: int) -> List[Dict[str, Any]]:
    """Get all issues for a property."""
    query = "SELECT * FROM issues WHERE property_id = $1 ORDER BY created_at DESC"
    rows = await fetch_all(query, property_id)
    return [dict(row) for row in rows]


async def get_issues_by_tenant(tenant_id: int) -> List[Dict[str, Any]]:
    """Get all issues for a tenant."""
    query = "SELECT * FROM issues WHERE tenant_id = $1 ORDER BY created_at DESC"
    rows = await fetch_all(query, tenant_id)
    return [dict(row) for row in rows]


async def get_issues_by_status(status: str) -> List[Dict[str, Any]]:
    """Get all issues with a specific status."""
    query = "SELECT * FROM issues WHERE status = $1 ORDER BY created_at DESC"
    rows = await fetch_all(query, status)
    return [dict(row) for row in rows]


async def update_issue_status(
    issue_id: int,
    status: str,
    resolved_by_agent: Optional[str] = None,
    assigned_to: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Update issue status."""
    if resolved_by_agent:
        query = """
            UPDATE issues
            SET status = $2, resolved_by_agent = $3, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """
        row = await execute_returning(query, issue_id, status, resolved_by_agent)
    elif assigned_to:
        query = """
            UPDATE issues
            SET status = $2, assigned_to = $3, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """
        row = await execute_returning(query, issue_id, status, assigned_to)
    else:
        query = """
            UPDATE issues
            SET status = $2, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """
        row = await execute_returning(query, issue_id, status)
    return dict(row) if row else None


async def set_follow_up_date(issue_id: int, follow_up_date: datetime) -> Optional[Dict[str, Any]]:
    """Set a follow-up date for an issue."""
    query = """
        UPDATE issues
        SET follow_up_date = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    """
    row = await execute_returning(query, issue_id, follow_up_date)
    return dict(row) if row else None


async def close_issue(issue_id: int) -> Optional[Dict[str, Any]]:
    """Close an issue."""
    query = """
        UPDATE issues
        SET status = 'closed', closed_at = NOW(), updated_at = NOW()
        WHERE id = $1
        RETURNING *
    """
    row = await execute_returning(query, issue_id)
    return dict(row) if row else None

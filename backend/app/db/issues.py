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


async def get_all_issues(limit: int = 100) -> List[Dict[str, Any]]:
    """Get all issues, ordered by most recent."""
    query = "SELECT * FROM issues ORDER BY created_at DESC LIMIT $1"
    rows = await fetch_all(query, limit)
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


async def update_pm_notes(issue_id: int, notes: str) -> Optional[Dict[str, Any]]:
    """Update property manager notes on an issue."""
    query = """
        UPDATE issues
        SET pm_notes = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    """
    row = await execute_returning(query, issue_id, notes)
    return dict(row) if row else None


async def set_agent_muted(issue_id: int, muted: bool) -> Optional[Dict[str, Any]]:
    """Mute or unmute the AI agent for this issue."""
    try:
        query = """
            UPDATE issues
            SET agent_muted = $2, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """
        row = await execute_returning(query, issue_id, muted)
        return dict(row) if row else None
    except Exception:
        # Column might not exist - try to create it
        try:
            await execute("ALTER TABLE issues ADD COLUMN IF NOT EXISTS agent_muted BOOLEAN DEFAULT FALSE")
            row = await execute_returning(
                "UPDATE issues SET agent_muted = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
                issue_id, muted
            )
            return dict(row) if row else None
        except Exception:
            return None


async def is_agent_muted(issue_id: int) -> bool:
    """Check if the agent is muted for this issue."""
    try:
        query = "SELECT agent_muted FROM issues WHERE id = $1"
        row = await fetch_one(query, issue_id)
        return bool(row["agent_muted"]) if row and row.get("agent_muted") else False
    except Exception:
        # Column might not exist yet - return False (not muted)
        return False


async def update_issue_priority(issue_id: int, priority: str) -> Optional[Dict[str, Any]]:
    """Update issue priority."""
    query = """
        UPDATE issues
        SET priority = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    """
    row = await execute_returning(query, issue_id, priority)
    return dict(row) if row else None


async def assign_issue(issue_id: int, assigned_to: str) -> Optional[Dict[str, Any]]:
    """Assign issue to a team member."""
    query = """
        UPDATE issues
        SET assigned_to = $2, status = CASE WHEN status = 'new' THEN 'assigned' ELSE status END, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    """
    row = await execute_returning(query, issue_id, assigned_to)
    return dict(row) if row else None

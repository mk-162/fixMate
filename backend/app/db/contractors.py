"""Contractor database operations."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.db.database import fetch_one, fetch_all, execute_returning


async def get_contractors(
    organization_id: str,
    trade: Optional[str] = None,
    is_active: Optional[int] = 1
) -> List[Dict[str, Any]]:
    """Get all contractors for an organization."""
    if trade:
        query = """
            SELECT * FROM contractors
            WHERE organization_id = $1 AND trade = $2 AND is_active = $3
            ORDER BY name
        """
        rows = await fetch_all(query, organization_id, trade, is_active)
    else:
        query = """
            SELECT * FROM contractors
            WHERE organization_id = $1 AND is_active = $2
            ORDER BY name
        """
        rows = await fetch_all(query, organization_id, is_active)
    return [dict(row) for row in rows] if rows else []


async def get_contractor(contractor_id: int) -> Optional[Dict[str, Any]]:
    """Get a contractor by ID."""
    query = "SELECT * FROM contractors WHERE id = $1"
    row = await fetch_one(query, contractor_id)
    return dict(row) if row else None


async def get_contractors_for_category(
    organization_id: str,
    category: str
) -> List[Dict[str, Any]]:
    """Get contractors suitable for an issue category."""
    # Map issue categories to contractor trades
    category_to_trades = {
        'plumbing': ['plumbing'],
        'electrical': ['electrical'],
        'appliance': ['appliance', 'electrical'],
        'heating': ['heating', 'plumbing'],
        'structural': ['carpentry', 'roofing', 'general'],
        'security': ['locksmith'],
        'general': ['general'],
        'other': ['general', 'other'],
    }

    trades = category_to_trades.get(category, ['general'])

    # Build query with IN clause
    placeholders = ', '.join(f'${i+2}' for i in range(len(trades)))
    query = f"""
        SELECT * FROM contractors
        WHERE organization_id = $1
        AND trade IN ({placeholders})
        AND is_active = 1
        ORDER BY name
    """
    rows = await fetch_all(query, organization_id, *trades)
    return [dict(row) for row in rows] if rows else []


async def create_assignment(
    issue_id: int,
    contractor_id: int,
    scheduled_for: Optional[datetime] = None,
    notes: Optional[str] = None,
    quoted_amount: Optional[int] = None
) -> Dict[str, Any]:
    """Create a contractor assignment for an issue."""
    query = """
        INSERT INTO contractor_assignments
        (issue_id, contractor_id, scheduled_for, notes, quoted_amount)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    """
    row = await execute_returning(
        query, issue_id, contractor_id, scheduled_for, notes, quoted_amount
    )
    return dict(row)


async def get_assignment_for_issue(issue_id: int) -> Optional[Dict[str, Any]]:
    """Get the current assignment for an issue with contractor details."""
    query = """
        SELECT
            ca.*,
            c.name as contractor_name,
            c.company as contractor_company,
            c.phone as contractor_phone,
            c.email as contractor_email,
            c.trade as contractor_trade,
            c.hourly_rate as contractor_hourly_rate
        FROM contractor_assignments ca
        JOIN contractors c ON ca.contractor_id = c.id
        WHERE ca.issue_id = $1
        ORDER BY ca.assigned_at DESC
        LIMIT 1
    """
    row = await fetch_one(query, issue_id)
    return dict(row) if row else None


async def complete_assignment(
    assignment_id: int,
    actual_amount: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    """Mark an assignment as completed."""
    query = """
        UPDATE contractor_assignments
        SET completed_at = NOW(), actual_amount = COALESCE($2, actual_amount), updated_at = NOW()
        WHERE id = $1
        RETURNING *
    """
    row = await execute_returning(query, assignment_id, actual_amount)
    return dict(row) if row else None


async def get_contractor_stats(organization_id: str) -> Dict[str, Any]:
    """Get contractor statistics for an organization."""
    # Total contractors
    total_query = """
        SELECT COUNT(*) as count FROM contractors
        WHERE organization_id = $1
    """
    total = await fetch_one(total_query, organization_id)

    # Active contractors
    active_query = """
        SELECT COUNT(*) as count FROM contractors
        WHERE organization_id = $1 AND is_active = 1
    """
    active = await fetch_one(active_query, organization_id)

    # Contractors by trade
    by_trade_query = """
        SELECT trade, COUNT(*) as count
        FROM contractors
        WHERE organization_id = $1
        GROUP BY trade
        ORDER BY count DESC
    """
    by_trade = await fetch_all(by_trade_query, organization_id)

    return {
        'total': total['count'] if total else 0,
        'active': active['count'] if active else 0,
        'by_trade': [dict(row) for row in by_trade] if by_trade else []
    }

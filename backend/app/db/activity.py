"""Agent activity logging."""
import json
from typing import Optional, List, Dict, Any
from app.db.database import fetch_all, execute_returning


async def log_activity(
    issue_id: Optional[int],
    action: str,
    details: Optional[Dict[str, Any]] = None,
    would_notify: Optional[str] = None,
) -> Dict[str, Any]:
    """Log an agent activity."""
    query = """
        INSERT INTO agent_activity (issue_id, action, details, would_notify)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    """
    details_str = json.dumps(details) if details else None
    row = await execute_returning(query, issue_id, action, details_str, would_notify)
    return dict(row)


async def get_activities(issue_id: Optional[int] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Get agent activities, optionally filtered by issue."""
    if issue_id:
        query = """
            SELECT * FROM agent_activity
            WHERE issue_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        """
        rows = await fetch_all(query, issue_id, limit)
    else:
        query = """
            SELECT * FROM agent_activity
            ORDER BY created_at DESC
            LIMIT $1
        """
        rows = await fetch_all(query, limit)

    activities = []
    for row in rows:
        act = dict(row)
        if act.get("details"):
            act["details"] = json.loads(act["details"])
        activities.append(act)
    return activities

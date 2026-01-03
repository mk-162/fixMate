"""Issue messages database operations."""
import json
from typing import Optional, List, Dict, Any
from app.db.database import fetch_all, execute_returning


async def add_message(
    issue_id: int,
    role: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Add a message to an issue conversation."""
    query = """
        INSERT INTO issue_messages (issue_id, role, content, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    """
    metadata_str = json.dumps(metadata) if metadata else None
    row = await execute_returning(query, issue_id, role, content, metadata_str)
    return dict(row)


async def get_messages(issue_id: int) -> List[Dict[str, Any]]:
    """Get all messages for an issue."""
    query = """
        SELECT * FROM issue_messages
        WHERE issue_id = $1
        ORDER BY created_at ASC
    """
    rows = await fetch_all(query, issue_id)
    messages = []
    for row in rows:
        msg = dict(row)
        if msg.get("metadata"):
            msg["metadata"] = json.loads(msg["metadata"])
        messages.append(msg)
    return messages


async def get_conversation_context(issue_id: int) -> str:
    """Get the conversation as a formatted string for the agent."""
    messages = await get_messages(issue_id)
    lines = []
    for msg in messages:
        role = msg["role"].upper()
        content = msg["content"]
        lines.append(f"{role}: {content}")
    return "\n".join(lines)

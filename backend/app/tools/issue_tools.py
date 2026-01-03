"""Claude Agent SDK tools for issue management.

NOTE: This module has been consolidated into the triage_agent.py module.
These imports are kept for backwards compatibility.

The new tools are more powerful and include:
- Emergency detection
- Cost estimation
- Sentiment analysis
- Enhanced messaging with type tracking

For new development, import from app.agents.triage_agent directly.
"""

# Re-export from the new location for backwards compatibility
from app.agents.triage_agent import (
    send_message as send_message_to_tenant,
    log_reasoning as log_agent_action,
    schedule_followup,
    escalate_issue,
    resolve_issue as resolve_with_help,
    detect_emergency,
    estimate_repair_cost,
    assess_sentiment,
    get_issue_context,
    get_all_tools as get_issue_tools,
    create_fixmate_mcp_server,
)

# Backwards compatibility alias
update_status = None  # Deprecated - use escalate_issue or resolve_issue instead

__all__ = [
    "send_message_to_tenant",
    "log_agent_action",
    "schedule_followup",
    "escalate_issue",
    "resolve_with_help",
    "detect_emergency",
    "estimate_repair_cost",
    "assess_sentiment",
    "get_issue_context",
    "get_issue_tools",
    "create_fixmate_mcp_server",
]

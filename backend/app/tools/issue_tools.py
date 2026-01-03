"""Claude Agent SDK tools for issue management."""
from datetime import datetime, timedelta
from claude_agent_sdk import tool, create_sdk_mcp_server

from app.db import issues, messages, activity


@tool(
    "update_issue_status",
    "Update the status of a maintenance issue",
    {
        "issue_id": int,
        "status": str,  # new, triaging, resolved_by_agent, escalated, assigned, in_progress, awaiting_confirmation, closed
    }
)
async def update_status(args):
    """Update issue status."""
    issue = await issues.update_issue_status(args["issue_id"], args["status"])
    if issue:
        await activity.log_activity(
            args["issue_id"],
            f"status_changed_to_{args['status']}",
            {"new_status": args["status"]}
        )
        return {"content": [{"type": "text", "text": f"Status updated to {args['status']}"}]}
    return {"content": [{"type": "text", "text": "Failed to update status"}], "is_error": True}


@tool(
    "send_message_to_tenant",
    "Send a message to the tenant about their issue. Use this to ask clarifying questions or provide troubleshooting help.",
    {
        "issue_id": int,
        "message": str,
    }
)
async def send_message(args):
    """Send a message to the tenant."""
    await messages.add_message(
        args["issue_id"],
        "agent",
        args["message"]
    )
    await activity.log_activity(
        args["issue_id"],
        "sent_message",
        {"message_preview": args["message"][:100]},
        would_notify="tenant"
    )
    return {"content": [{"type": "text", "text": f"Message sent to tenant: {args['message'][:50]}..."}]}


@tool(
    "log_reasoning",
    "Log your reasoning or observations about the issue. This helps track decision-making.",
    {
        "issue_id": int,
        "reasoning": str,
    }
)
async def log_agent_action(args):
    """Log agent reasoning."""
    await activity.log_activity(
        args["issue_id"],
        "reasoning",
        {"reasoning": args["reasoning"]}
    )
    return {"content": [{"type": "text", "text": "Reasoning logged"}]}


@tool(
    "schedule_followup",
    "Schedule a follow-up check on the issue after a specified number of days.",
    {
        "issue_id": int,
        "days": int,
        "reason": str,
    }
)
async def schedule_followup(args):
    """Schedule a follow-up."""
    follow_up_date = datetime.now() + timedelta(days=args["days"])
    await issues.set_follow_up_date(args["issue_id"], follow_up_date)
    await activity.log_activity(
        args["issue_id"],
        "scheduled_followup",
        {"days": args["days"], "date": follow_up_date.isoformat(), "reason": args["reason"]},
        would_notify="tenant"
    )
    return {"content": [{"type": "text", "text": f"Follow-up scheduled for {follow_up_date.strftime('%Y-%m-%d')}"}]}


@tool(
    "escalate_to_property_manager",
    "Escalate the issue to the property manager because it requires professional attention.",
    {
        "issue_id": int,
        "reason": str,
        "priority": str,  # low, medium, high, urgent
    }
)
async def escalate_issue(args):
    """Escalate to property manager."""
    await issues.update_issue_status(args["issue_id"], "escalated")
    await messages.add_message(
        args["issue_id"],
        "system",
        f"Issue escalated to property manager. Reason: {args['reason']}. Priority: {args['priority']}"
    )
    await activity.log_activity(
        args["issue_id"],
        "escalated",
        {"reason": args["reason"], "priority": args["priority"]},
        would_notify="property_manager,landlord"
    )
    return {"content": [{"type": "text", "text": f"Issue escalated with {args['priority']} priority: {args['reason']}"}]}


@tool(
    "resolve_with_troubleshooting",
    "Mark the issue as resolved because you helped the tenant fix it themselves with troubleshooting advice.",
    {
        "issue_id": int,
        "solution": str,  # What solved the problem
    }
)
async def resolve_with_help(args):
    """Resolve issue with agent help."""
    await issues.update_issue_status(
        args["issue_id"],
        "resolved_by_agent",
        resolved_by_agent=args["solution"]
    )
    await messages.add_message(
        args["issue_id"],
        "system",
        f"Issue resolved with agent assistance: {args['solution']}"
    )
    await activity.log_activity(
        args["issue_id"],
        "resolved_by_agent",
        {"solution": args["solution"]},
        would_notify="property_manager"  # Let PM know we saved them a callout
    )
    # Schedule a follow-up to confirm it's still resolved
    follow_up_date = datetime.now() + timedelta(days=3)
    await issues.set_follow_up_date(args["issue_id"], follow_up_date)
    return {"content": [{"type": "text", "text": f"Issue resolved! Solution: {args['solution']}. Follow-up scheduled for 3 days."}]}


def get_issue_tools():
    """Get all issue management tools for the MCP server."""
    return [
        update_status,
        send_message,
        log_agent_action,
        schedule_followup,
        escalate_issue,
        resolve_with_help,
    ]


def create_fixmate_mcp_server():
    """Create the FixMate MCP server with all tools."""
    return create_sdk_mcp_server(
        name="fixmate",
        version="1.0.0",
        tools=get_issue_tools()
    )

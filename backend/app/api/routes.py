"""API routes for FixMate."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.db import issues, messages, activity
from app.agents import TriageAgent
from app.agents.triage_agent import AgentAnalytics

router = APIRouter()
triage_agent = TriageAgent()


# Request/Response models
class CreateIssueRequest(BaseModel):
    tenant_id: int
    property_id: int
    title: str
    description: str
    category: Optional[str] = None
    skip_agent: Optional[bool] = False
    priority: Optional[str] = None
    assigned_to: Optional[str] = None


class TenantMessageRequest(BaseModel):
    message: str
    role: Optional[str] = "tenant"  # "tenant" or "team"


class IssueResponse(BaseModel):
    id: int
    tenant_id: int
    property_id: int
    title: str
    description: str
    category: Optional[str]
    status: str
    priority: Optional[str]
    resolved_by_agent: Optional[str]
    assigned_to: Optional[str]

    class Config:
        from_attributes = True


# Issue endpoints
@router.post("/issues", response_model=dict)
async def create_issue(request: CreateIssueRequest):
    """Create a new maintenance issue.

    If skip_agent=True (team member workflow), the issue is created with
    status 'escalated' and no AI agent is triggered.
    """
    # Create the issue
    issue = await issues.create_issue(
        tenant_id=request.tenant_id,
        property_id=request.property_id,
        title=request.title,
        description=request.description,
        category=request.category,
    )

    # Handle team member workflow (skip AI agent)
    if request.skip_agent:
        # Set status to escalated and apply priority/assignment if provided
        await issues.update_issue_status(issue["id"], "escalated")

        if request.priority:
            await issues.update_issue_priority(issue["id"], request.priority)

        if request.assigned_to:
            await issues.assign_issue(issue["id"], request.assigned_to)

        # Record as system message (team member created)
        await messages.add_message(
            issue["id"],
            "system",
            f"Issue logged by team member: {request.title}\n\n{request.description}"
        )

        # Log activity
        await activity.log_activity(
            issue["id"],
            "team_issue_created",
            {
                "priority": request.priority,
                "assigned_to": request.assigned_to,
            },
            would_notify="tenant" if request.assigned_to else None
        )

        return {"id": issue["id"], "status": "created", "message": "Team issue created"}

    # Standard tenant workflow - trigger AI agent
    await messages.add_message(
        issue["id"],
        "tenant",
        f"Issue reported: {request.title}\n\n{request.description}"
    )

    try:
        await triage_agent.handle_new_issue(issue["id"])
    except Exception as e:
        await activity.log_activity(
            issue["id"],
            "agent_error",
            {"error": str(e)}
        )

    return {"id": issue["id"], "status": "created", "message": "Issue created and agent notified"}


@router.get("/issues/{issue_id}")
async def get_issue(issue_id: int):
    """Get issue details."""
    issue = await issues.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.get("/issues")
async def list_issues(
    property_id: Optional[int] = None,
    tenant_id: Optional[int] = None,
    status: Optional[str] = None,
):
    """List issues with optional filters."""
    if property_id:
        return await issues.get_issues_by_property(property_id)
    elif tenant_id:
        return await issues.get_issues_by_tenant(tenant_id)
    elif status:
        return await issues.get_issues_by_status(status)
    else:
        # Return all recent issues
        return await issues.get_all_issues()


@router.post("/issues/{issue_id}/messages")
async def send_message(issue_id: int, request: TenantMessageRequest):
    """Send a message to the conversation. Role determines if agent responds."""
    issue = await issues.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    role = request.role or "tenant"

    # Only trigger agent for tenant messages
    if role == "tenant":
        # Agent's handle_tenant_response adds the message
        try:
            await triage_agent.handle_tenant_response(issue_id, request.message)
        except Exception as e:
            await activity.log_activity(
                issue_id,
                "agent_error",
                {"error": str(e)}
            )
        return {"status": "message_sent", "message": "Agent will respond shortly"}
    else:
        # Team message - save message and log activity, no agent response
        await messages.add_message(issue_id, "team", request.message)
        await activity.log_activity(
            issue_id,
            "team_message",
            {"message_preview": request.message[:100]}
        )
        return {"status": "message_sent", "message": "Team message recorded"}


@router.get("/issues/{issue_id}/messages")
async def get_issue_messages(issue_id: int):
    """Get all messages for an issue."""
    issue = await issues.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return await messages.get_messages(issue_id)


@router.get("/issues/{issue_id}/activity")
async def get_issue_activity(issue_id: int):
    """Get agent activity log for an issue."""
    return await activity.get_activities(issue_id)


# Property Manager endpoints
@router.post("/issues/{issue_id}/assign")
async def assign_tradesperson(issue_id: int, assigned_to: str):
    """Property manager assigns a tradesperson."""
    issue = await issues.update_issue_status(
        issue_id,
        "assigned",
        assigned_to=assigned_to
    )
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    await activity.log_activity(
        issue_id,
        "tradesperson_assigned",
        {"assigned_to": assigned_to},
        would_notify="tenant,landlord"
    )
    return {"status": "assigned", "assigned_to": assigned_to}


@router.post("/issues/{issue_id}/close")
async def close_issue(issue_id: int):
    """Close a resolved issue."""
    issue = await issues.close_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    await activity.log_activity(
        issue_id,
        "issue_closed",
        {},
        would_notify="tenant"
    )
    return {"status": "closed"}


class UpdateStatusRequest(BaseModel):
    status: str


class UpdateNotesRequest(BaseModel):
    notes: str


class UpdatePriorityRequest(BaseModel):
    priority: str


class AssignIssueRequest(BaseModel):
    assigned_to: str


class MuteAgentRequest(BaseModel):
    muted: bool


@router.put("/issues/{issue_id}/status")
async def update_issue_status(issue_id: int, request: UpdateStatusRequest):
    """Update issue status directly."""
    valid_statuses = [
        "new", "triaging", "resolved_by_agent", "escalated",
        "assigned", "in_progress", "awaiting_confirmation", "closed"
    ]
    if request.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    if request.status == "closed":
        issue = await issues.close_issue(issue_id)
    else:
        issue = await issues.update_issue_status(issue_id, request.status)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    await activity.log_activity(
        issue_id,
        "status_updated",
        {"new_status": request.status},
        would_notify="tenant"
    )
    return {"status": request.status}


@router.put("/issues/{issue_id}/notes")
async def update_issue_notes(issue_id: int, request: UpdateNotesRequest):
    """Update property manager notes on an issue."""
    issue = await issues.update_pm_notes(issue_id, request.notes)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    await activity.log_activity(
        issue_id,
        "notes_updated",
        {"notes_length": len(request.notes)},
        would_notify=None
    )
    return {"status": "updated", "pm_notes": request.notes}


@router.put("/issues/{issue_id}/priority")
async def update_priority(issue_id: int, request: UpdatePriorityRequest):
    """Update issue priority."""
    valid_priorities = ["low", "medium", "high", "urgent"]
    if request.priority not in valid_priorities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid priority. Must be one of: {valid_priorities}"
        )

    issue = await issues.update_issue_priority(issue_id, request.priority)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    await activity.log_activity(
        issue_id,
        "priority_updated",
        {"new_priority": request.priority},
        would_notify=None
    )
    return {"status": "updated", "priority": request.priority}


@router.put("/issues/{issue_id}/assign")
async def assign_issue(issue_id: int, request: AssignIssueRequest):
    """Assign issue to a team member."""
    issue = await issues.assign_issue(issue_id, request.assigned_to)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    await activity.log_activity(
        issue_id,
        "issue_assigned",
        {"assigned_to": request.assigned_to},
        would_notify="tenant"
    )
    return {"status": "assigned", "assigned_to": request.assigned_to}


@router.put("/issues/{issue_id}/mute-agent")
async def mute_agent(issue_id: int, request: MuteAgentRequest):
    """Mute or unmute the AI agent for this issue.

    When muted, the AI agent will not respond to tenant messages.
    Use this for sensitive issues that require human handling.
    """
    issue = await issues.set_agent_muted(issue_id, request.muted)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    action = "agent_muted" if request.muted else "agent_unmuted"
    await activity.log_activity(
        issue_id,
        action,
        {"muted": request.muted},
        would_notify=None
    )
    return {"status": "updated", "agent_muted": request.muted}


@router.get("/issues/{issue_id}/agent-status")
async def get_agent_status(issue_id: int):
    """Check if the AI agent is muted for this issue."""
    muted = await issues.is_agent_muted(issue_id)
    return {"issue_id": issue_id, "agent_muted": muted}


# Activity feed endpoint (for dashboard)
@router.get("/activity")
async def get_all_activity(limit: int = 50):
    """Get recent agent activity across all issues."""
    return await activity.get_activities(limit=limit)


# ============================================================================
# Analytics Endpoints (For Investor Demos!)
# ============================================================================

@router.get("/analytics/overview")
async def get_analytics_overview():
    """Get comprehensive analytics overview for the dashboard.

    Returns:
    - Resolution statistics (total issues, resolution rate, savings)
    - Category breakdown
    - Response time metrics

    Perfect for investor demos to show AI impact!
    """
    resolution_stats = await AgentAnalytics.get_resolution_stats()
    category_breakdown = await AgentAnalytics.get_category_breakdown()
    response_times = await AgentAnalytics.get_response_time_stats()

    return {
        "resolution": resolution_stats,
        "categories": category_breakdown,
        "response_times": response_times,
        "highlights": {
            "ai_resolution_rate": f"{resolution_stats['resolution_rate']:.1f}%",
            "total_savings": f"£{resolution_stats['estimated_savings']:,}",
            "avg_response_time": response_times["avg_response_formatted"],
            "issues_handled": resolution_stats["total_issues"],
        }
    }


@router.get("/analytics/resolution")
async def get_resolution_stats():
    """Get detailed resolution statistics.

    Shows how many issues the AI resolved vs escalated,
    and estimated cost savings from avoided callouts.
    """
    return await AgentAnalytics.get_resolution_stats()


@router.get("/analytics/categories")
async def get_category_breakdown():
    """Get issue breakdown by category.

    Shows which types of issues the AI handles best.
    """
    return await AgentAnalytics.get_category_breakdown()


@router.get("/analytics/response-times")
async def get_response_time_stats():
    """Get agent response time statistics.

    Shows how quickly the AI responds to tenant issues.
    """
    return await AgentAnalytics.get_response_time_stats()


@router.get("/demo/simulate-issue")
async def simulate_demo_issue(
    scenario: str = "washing_machine",
):
    """Simulate a demo issue for investor presentations.

    Scenarios:
    - washing_machine: Common appliance issue (high resolution rate)
    - emergency: Gas leak scenario (immediate escalation)
    - heating: Boiler troubleshooting
    - plumbing: Blocked drain

    This creates a realistic demo without needing real tenant data.
    """
    scenarios = {
        "washing_machine": {
            "title": "Washing machine won't start",
            "description": "My washing machine won't turn on. I pressed the power button but nothing happens. The display is completely blank.",
            "category": "appliance",
        },
        "emergency": {
            "title": "Smell gas in kitchen",
            "description": "I can smell gas near the cooker in my kitchen. It started about 10 minutes ago. Should I be worried?",
            "category": "heating",
        },
        "heating": {
            "title": "No hot water this morning",
            "description": "Woke up to find we have no hot water. The boiler is showing an error code E119. Radiators are working fine though.",
            "category": "heating",
        },
        "plumbing": {
            "title": "Kitchen sink draining slowly",
            "description": "The kitchen sink is draining really slowly. It takes about 5 minutes for the water to go down. Getting worse over the past week.",
            "category": "plumbing",
        },
    }

    if scenario not in scenarios:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario. Available: {list(scenarios.keys())}"
        )

    scenario_data = scenarios[scenario]

    # Create a demo issue (using tenant_id=1, property_id=1 for demo)
    issue = await issues.create_issue(
        tenant_id=1,
        property_id=1,
        title=scenario_data["title"],
        description=scenario_data["description"],
        category=scenario_data["category"],
    )

    # Record the initial description as a tenant message
    await messages.add_message(
        issue["id"],
        "tenant",
        f"Issue reported: {scenario_data['title']}\n\n{scenario_data['description']}"
    )

    # Trigger the triage agent
    try:
        await triage_agent.handle_new_issue(issue["id"])
    except Exception as e:
        await activity.log_activity(
            issue["id"],
            "agent_error",
            {"error": str(e)}
        )

    return {
        "issue_id": issue["id"],
        "scenario": scenario,
        "status": "created",
        "message": f"Demo issue created: {scenario_data['title']}",
        "next_steps": [
            f"GET /api/issues/{issue['id']} - View issue details",
            f"GET /api/issues/{issue['id']}/messages - View conversation",
            f"GET /api/issues/{issue['id']}/activity - View agent activity",
            f"POST /api/issues/{issue['id']}/messages - Simulate tenant response",
        ]
    }

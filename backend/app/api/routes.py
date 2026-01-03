"""API routes for FixMate."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.db import issues, messages, activity
from app.agents import TriageAgent

router = APIRouter()
triage_agent = TriageAgent()


# Request/Response models
class CreateIssueRequest(BaseModel):
    tenant_id: int
    property_id: int
    title: str
    description: str
    category: Optional[str] = None


class TenantMessageRequest(BaseModel):
    message: str


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
    """Create a new maintenance issue and trigger triage agent."""
    # Create the issue
    issue = await issues.create_issue(
        tenant_id=request.tenant_id,
        property_id=request.property_id,
        title=request.title,
        description=request.description,
        category=request.category,
    )

    # Record the initial description as a tenant message
    await messages.add_message(
        issue["id"],
        "tenant",
        f"Issue reported: {request.title}\n\n{request.description}"
    )

    # Trigger the triage agent
    try:
        await triage_agent.handle_new_issue(issue["id"])
    except Exception as e:
        # Log error but don't fail the request
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
        # Return all recent issues (would add pagination in production)
        return await issues.get_issues_by_status("new")


@router.post("/issues/{issue_id}/messages")
async def send_tenant_message(issue_id: int, request: TenantMessageRequest):
    """Tenant sends a message/response to the conversation."""
    issue = await issues.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Trigger agent to respond
    try:
        await triage_agent.handle_tenant_response(issue_id, request.message)
    except Exception as e:
        await activity.log_activity(
            issue_id,
            "agent_error",
            {"error": str(e)}
        )

    return {"status": "message_sent", "message": "Agent will respond shortly"}


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


# Activity feed endpoint (for dashboard)
@router.get("/activity")
async def get_all_activity(limit: int = 50):
    """Get recent agent activity across all issues."""
    return await activity.get_activities(limit=limit)

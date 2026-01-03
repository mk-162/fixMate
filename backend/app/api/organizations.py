"""API routes for organization management."""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from app.db.organizations import organizations

router = APIRouter(prefix="/api/organizations", tags=["organizations"])


class CreateOrgRequest(BaseModel):
    clerk_org_id: str
    name: str


@router.post("/sync")
async def sync_organization(
    request: CreateOrgRequest,
):
    """Create or update organization from Clerk."""
    org = await organizations.get_or_create(
        clerk_org_id=request.clerk_org_id,
        name=request.name,
    )
    return org


@router.get("/current")
async def get_current_organization(
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Get current organization details."""
    if not x_clerk_org_id:
        raise HTTPException(status_code=401, detail="Organization ID required")
    
    org = await organizations.get_by_clerk_id(x_clerk_org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return org

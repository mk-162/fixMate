"""API routes for tenant management."""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from app.db.tenants import tenants
from app.db.organizations import organizations

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


class CreateTenantRequest(BaseModel):
    name: str
    property_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class UpdateTenantRequest(BaseModel):
    name: Optional[str] = None
    property_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None


async def get_org_id_from_header(x_clerk_org_id: Optional[str] = Header(None)) -> int:
    """Get internal org_id from Clerk org header."""
    if not x_clerk_org_id:
        raise HTTPException(status_code=401, detail="Organization ID required")
    
    org = await organizations.get_by_clerk_id(x_clerk_org_id)
    if not org:
        # Auto-create org if it doesn't exist
        org = await organizations.create(x_clerk_org_id, "Organization")
    
    return org["id"]


@router.post("")
async def create_tenant(
    request: CreateTenantRequest,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Create a new tenant."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    tenant = await tenants.create(
        org_id=org_id,
        name=request.name,
        property_id=request.property_id,
        email=request.email,
        phone=request.phone,
    )
    return tenant


@router.get("")
async def list_tenants(
    include_inactive: bool = False,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """List all tenants for the organization."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    return await tenants.get_by_org(org_id, include_inactive=include_inactive)


@router.get("/{tenant_id}")
async def get_tenant(
    tenant_id: int,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Get a single tenant."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    tenant = await tenants.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Verify org ownership
    if tenant["org_id"] != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return tenant


@router.put("/{tenant_id}")
async def update_tenant(
    tenant_id: int,
    request: UpdateTenantRequest,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Update a tenant."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    # Verify ownership first
    tenant = await tenants.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if tenant["org_id"] != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated = await tenants.update(
        tenant_id,
        name=request.name,
        email=request.email,
        phone=request.phone,
        property_id=request.property_id,
    )
    return updated


@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: int,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Soft delete a tenant (preserves history)."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    # Verify ownership first
    tenant = await tenants.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if tenant["org_id"] != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await tenants.soft_delete(tenant_id)
    return {"status": "deleted"}

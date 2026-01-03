"""API routes for properties management."""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from app.db.properties import properties
from app.db.organizations import organizations
from app.db.tenants import tenants as tenants_db

router = APIRouter(prefix="/api/properties", tags=["properties"])


class CreatePropertyRequest(BaseModel):
    name: str
    address: Optional[str] = None


class UpdatePropertyRequest(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None


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
async def create_property(
    request: CreatePropertyRequest,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Create a new property."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    property_data = await properties.create(
        org_id=org_id,
        name=request.name,
        address=request.address,
    )
    return property_data


@router.get("")
async def list_properties(
    x_clerk_org_id: Optional[str] = Header(None),
):
    """List all properties for the organization."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    # Pass both org_id (Railway model) and clerk_org_id (Drizzle model)
    return await properties.get_by_org(org_id, clerk_org_id=x_clerk_org_id)


@router.get("/{property_id}")
async def get_property(
    property_id: int,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Get a single property."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    prop = await properties.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Verify org ownership
    if prop["org_id"] != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return prop


@router.put("/{property_id}")
async def update_property(
    property_id: int,
    request: UpdatePropertyRequest,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Update a property."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    # Verify ownership first
    prop = await properties.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop["org_id"] != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated = await properties.update(
        property_id,
        name=request.name,
        address=request.address,
    )
    return updated


@router.delete("/{property_id}")
async def delete_property(
    property_id: int,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Delete a property."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    # Verify ownership first
    prop = await properties.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop["org_id"] != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await properties.delete(property_id)
    return {"status": "deleted"}


@router.get("/{property_id}/tenants")
async def get_property_tenants(
    property_id: int,
    x_clerk_org_id: Optional[str] = Header(None),
):
    """Get all tenants for a property."""
    org_id = await get_org_id_from_header(x_clerk_org_id)
    
    # Verify ownership first
    prop = await properties.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop["org_id"] != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return await tenants_db.get_by_property(property_id)

'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/libs/DB';
import { propertiesSchema, type Room, roomsSchema, tenantsSchema } from '@/models/Schema';

import type { RoomFormValues } from '../schemas/roomSchema';

// Get all rooms for a property
export async function getRooms(propertyId: number): Promise<Room[]> {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error('Unauthorized');
  }

  // Verify the property belongs to this org
  const property = await db
    .select()
    .from(propertiesSchema)
    .where(and(
      eq(propertiesSchema.id, propertyId),
      eq(propertiesSchema.ownerId, orgId),
    ))
    .limit(1);

  if (property.length === 0) {
    throw new Error('Property not found');
  }

  const rooms = await db
    .select()
    .from(roomsSchema)
    .where(eq(roomsSchema.propertyId, propertyId))
    .orderBy(roomsSchema.roomName);

  return rooms;
}

// Get a single room with tenant info
export async function getRoomWithTenant(roomId: number) {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error('Unauthorized');
  }

  const room = await db
    .select()
    .from(roomsSchema)
    .where(eq(roomsSchema.id, roomId))
    .limit(1);

  if (room.length === 0) {
    throw new Error('Room not found');
  }

  // Verify property belongs to org
  const property = await db
    .select()
    .from(propertiesSchema)
    .where(and(
      eq(propertiesSchema.id, room[0]!.propertyId),
      eq(propertiesSchema.ownerId, orgId),
    ))
    .limit(1);

  if (property.length === 0) {
    throw new Error('Unauthorized');
  }

  // Get tenant in this room
  const tenant = await db
    .select({
      id: tenantsSchema.id,
      name: tenantsSchema.name,
      email: tenantsSchema.email,
      phone: tenantsSchema.phone,
      leaseStart: tenantsSchema.leaseStart,
      leaseEnd: tenantsSchema.leaseEnd,
    })
    .from(tenantsSchema)
    .where(eq(tenantsSchema.roomId, roomId))
    .limit(1);

  return {
    room: room[0]!,
    tenant: tenant[0] ?? null,
  };
}

// Create a new room
export async function createRoom(propertyId: number, data: RoomFormValues): Promise<Room> {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error('Unauthorized');
  }

  // Verify property belongs to org
  const property = await db
    .select()
    .from(propertiesSchema)
    .where(and(
      eq(propertiesSchema.id, propertyId),
      eq(propertiesSchema.ownerId, orgId),
    ))
    .limit(1);

  if (property.length === 0) {
    throw new Error('Property not found');
  }

  const result = await db
    .insert(roomsSchema)
    .values({
      propertyId,
      roomName: data.roomName,
      floor: data.floor ?? 0,
      sizeSqm: data.sizeSqm ?? null,
      monthlyRent: data.monthlyRent,
      depositAmount: data.depositAmount ?? null,
      hasEnsuite: data.hasEnsuite ? 1 : 0,
      furnished: data.furnished ? 1 : 0,
      status: data.status ?? 'available',
      notes: data.notes ?? null,
    })
    .returning();

  revalidatePath(`/dashboard/properties/${propertyId}`);

  return result[0]!;
}

// Update a room
export async function updateRoom(roomId: number, data: Partial<RoomFormValues>): Promise<Room> {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error('Unauthorized');
  }

  // Get the room first
  const room = await db
    .select()
    .from(roomsSchema)
    .where(eq(roomsSchema.id, roomId))
    .limit(1);

  if (room.length === 0) {
    throw new Error('Room not found');
  }

  // Verify property belongs to org
  const property = await db
    .select()
    .from(propertiesSchema)
    .where(and(
      eq(propertiesSchema.id, room[0]!.propertyId),
      eq(propertiesSchema.ownerId, orgId),
    ))
    .limit(1);

  if (property.length === 0) {
    throw new Error('Unauthorized');
  }

  const updateData: Record<string, unknown> = {};

  if (data.roomName !== undefined) {
    updateData.roomName = data.roomName;
  }
  if (data.floor !== undefined) {
    updateData.floor = data.floor;
  }
  if (data.sizeSqm !== undefined) {
    updateData.sizeSqm = data.sizeSqm;
  }
  if (data.monthlyRent !== undefined) {
    updateData.monthlyRent = data.monthlyRent;
  }
  if (data.depositAmount !== undefined) {
    updateData.depositAmount = data.depositAmount;
  }
  if (data.hasEnsuite !== undefined) {
    updateData.hasEnsuite = data.hasEnsuite ? 1 : 0;
  }
  if (data.furnished !== undefined) {
    updateData.furnished = data.furnished ? 1 : 0;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  const result = await db
    .update(roomsSchema)
    .set(updateData)
    .where(eq(roomsSchema.id, roomId))
    .returning();

  revalidatePath(`/dashboard/properties/${room[0]!.propertyId}`);

  return result[0]!;
}

// Delete a room
export async function deleteRoom(roomId: number): Promise<void> {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error('Unauthorized');
  }

  // Get the room first
  const room = await db
    .select()
    .from(roomsSchema)
    .where(eq(roomsSchema.id, roomId))
    .limit(1);

  if (room.length === 0) {
    throw new Error('Room not found');
  }

  // Verify property belongs to org
  const property = await db
    .select()
    .from(propertiesSchema)
    .where(and(
      eq(propertiesSchema.id, room[0]!.propertyId),
      eq(propertiesSchema.ownerId, orgId),
    ))
    .limit(1);

  if (property.length === 0) {
    throw new Error('Unauthorized');
  }

  // Check if room has a tenant
  const tenant = await db
    .select({ id: tenantsSchema.id })
    .from(tenantsSchema)
    .where(eq(tenantsSchema.roomId, roomId))
    .limit(1);

  if (tenant.length > 0) {
    throw new Error('Cannot delete room with assigned tenant. Unassign tenant first.');
  }

  await db
    .delete(roomsSchema)
    .where(eq(roomsSchema.id, roomId));

  revalidatePath(`/dashboard/properties/${room[0]!.propertyId}`);
}

// Get rooms for a property with tenant info
export async function getRoomsWithTenants(propertyId: number) {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error('Unauthorized');
  }

  // Verify property belongs to org
  const property = await db
    .select()
    .from(propertiesSchema)
    .where(and(
      eq(propertiesSchema.id, propertyId),
      eq(propertiesSchema.ownerId, orgId),
    ))
    .limit(1);

  if (property.length === 0) {
    throw new Error('Property not found');
  }

  const rooms = await db
    .select()
    .from(roomsSchema)
    .where(eq(roomsSchema.propertyId, propertyId))
    .orderBy(roomsSchema.roomName);

  // Get tenants for all rooms
  const tenants = await db
    .select({
      id: tenantsSchema.id,
      roomId: tenantsSchema.roomId,
      name: tenantsSchema.name,
      email: tenantsSchema.email,
      leaseEnd: tenantsSchema.leaseEnd,
    })
    .from(tenantsSchema)
    .where(eq(tenantsSchema.propertyId, propertyId));

  // Map tenants to rooms
  const tenantsByRoom = new Map<number, typeof tenants[number]>();
  for (const tenant of tenants) {
    if (tenant.roomId) {
      tenantsByRoom.set(tenant.roomId, tenant);
    }
  }

  return rooms.map(room => ({
    ...room,
    tenant: tenantsByRoom.get(room.id) ?? null,
  }));
}

'use server';

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/libs/DB';
import { issuesSchema, propertiesSchema, roomsSchema, type Tenant, tenantsSchema } from '@/models/Schema';

import { tenantFormSchema, type TenantFormValues } from '../schemas/tenantSchema';

async function getOwnerId(): Promise<string> {
  const { orgId, userId } = await auth();
  const ownerId = orgId ?? userId;
  if (!ownerId) {
    throw new Error('Unauthorized');
  }
  return ownerId;
}

// Get all tenants for properties owned by current user
export async function getTenants(): Promise<Tenant[]> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Get all property IDs owned by this user
  const ownedProperties = await db
    .select({ id: propertiesSchema.id })
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId));

  const ownedPropertyIds = ownedProperties.map(p => p.id);

  if (ownedPropertyIds.length === 0) {
    return [];
  }

  const tenants = await db
    .select()
    .from(tenantsSchema)
    .where(inArray(tenantsSchema.propertyId, ownedPropertyIds))
    .orderBy(desc(tenantsSchema.createdAt));

  return tenants;
}

// Get tenants with property and room info
export async function getTenantsWithDetails() {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Get all property IDs owned by this user
  const ownedProperties = await db
    .select()
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId));

  const propertyMap = new Map(ownedProperties.map(p => [p.id, p]));
  const ownedPropertyIds = ownedProperties.map(p => p.id);

  if (ownedPropertyIds.length === 0) {
    return [];
  }

  const tenants = await db
    .select()
    .from(tenantsSchema)
    .where(inArray(tenantsSchema.propertyId, ownedPropertyIds))
    .orderBy(desc(tenantsSchema.createdAt));

  // Get rooms
  const rooms = await db
    .select()
    .from(roomsSchema)
    .where(inArray(roomsSchema.propertyId, ownedPropertyIds));

  const roomMap = new Map(rooms.map(r => [r.id, r]));

  return tenants.map(tenant => ({
    ...tenant,
    property: tenant.propertyId ? propertyMap.get(tenant.propertyId) ?? null : null,
    room: tenant.roomId ? roomMap.get(tenant.roomId) ?? null : null,
  }));
}

// Create a new tenant
export async function createTenant(data: TenantFormValues): Promise<Tenant> {
  const ownerId = await getOwnerId();
  const db = await getDb();
  const validated = tenantFormSchema.parse(data);

  // Verify property belongs to org if specified
  if (validated.propertyId) {
    const [property] = await db
      .select()
      .from(propertiesSchema)
      .where(and(
        eq(propertiesSchema.id, validated.propertyId),
        eq(propertiesSchema.ownerId, ownerId),
      ))
      .limit(1);

    if (!property) {
      throw new Error('Property not found');
    }
  }

  // Verify room belongs to property if specified
  if (validated.roomId && validated.propertyId) {
    const [room] = await db
      .select()
      .from(roomsSchema)
      .where(and(
        eq(roomsSchema.id, validated.roomId),
        eq(roomsSchema.propertyId, validated.propertyId),
      ))
      .limit(1);

    if (!room) {
      throw new Error('Room not found for this property');
    }
  }

  const [tenant] = await db
    .insert(tenantsSchema)
    .values({
      name: validated.name,
      email: validated.email,
      phone: validated.phone ?? null,
      propertyId: validated.propertyId ?? null,
      roomId: validated.roomId ?? null,
      leaseStart: validated.leaseStart ?? null,
      leaseEnd: validated.leaseEnd ?? null,
      rentAmount: validated.rentAmount ?? null,
      depositAmount: validated.depositAmount ?? null,
      depositScheme: validated.depositScheme ?? null,
      depositReference: validated.depositReference ?? null,
      emergencyContactName: validated.emergencyContactName ?? null,
      emergencyContactPhone: validated.emergencyContactPhone ?? null,
      emergencyContactRelation: validated.emergencyContactRelation ?? null,
      guarantorName: validated.guarantorName ?? null,
      guarantorEmail: validated.guarantorEmail ?? null,
      guarantorPhone: validated.guarantorPhone ?? null,
      guarantorAddress: validated.guarantorAddress ?? null,
      university: validated.university ?? null,
      course: validated.course ?? null,
      yearOfStudy: validated.yearOfStudy ?? null,
      notes: validated.notes ?? null,
    })
    .returning();

  revalidatePath('/dashboard/tenants');
  return tenant!;
}

// Update a tenant
export async function updateTenant(id: number, data: Partial<TenantFormValues>): Promise<Tenant> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Verify tenant belongs to one of our properties
  const ownedProperties = await db
    .select({ id: propertiesSchema.id })
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId));

  const ownedPropertyIds = ownedProperties.map(p => p.id);

  const [existingTenant] = await db
    .select()
    .from(tenantsSchema)
    .where(and(
      eq(tenantsSchema.id, id),
      ownedPropertyIds.length > 0
        ? inArray(tenantsSchema.propertyId, ownedPropertyIds)
        : undefined,
    ))
    .limit(1);

  if (!existingTenant) {
    throw new Error('Tenant not found');
  }

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.email !== undefined) {
    updateData.email = data.email;
  }
  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }
  if (data.propertyId !== undefined) {
    updateData.propertyId = data.propertyId;
  }
  if (data.roomId !== undefined) {
    updateData.roomId = data.roomId;
  }
  if (data.leaseStart !== undefined) {
    updateData.leaseStart = data.leaseStart;
  }
  if (data.leaseEnd !== undefined) {
    updateData.leaseEnd = data.leaseEnd;
  }
  if (data.rentAmount !== undefined) {
    updateData.rentAmount = data.rentAmount;
  }
  if (data.depositAmount !== undefined) {
    updateData.depositAmount = data.depositAmount;
  }
  if (data.depositScheme !== undefined) {
    updateData.depositScheme = data.depositScheme;
  }
  if (data.depositReference !== undefined) {
    updateData.depositReference = data.depositReference;
  }
  if (data.emergencyContactName !== undefined) {
    updateData.emergencyContactName = data.emergencyContactName;
  }
  if (data.emergencyContactPhone !== undefined) {
    updateData.emergencyContactPhone = data.emergencyContactPhone;
  }
  if (data.emergencyContactRelation !== undefined) {
    updateData.emergencyContactRelation = data.emergencyContactRelation;
  }
  if (data.guarantorName !== undefined) {
    updateData.guarantorName = data.guarantorName;
  }
  if (data.guarantorEmail !== undefined) {
    updateData.guarantorEmail = data.guarantorEmail;
  }
  if (data.guarantorPhone !== undefined) {
    updateData.guarantorPhone = data.guarantorPhone;
  }
  if (data.guarantorAddress !== undefined) {
    updateData.guarantorAddress = data.guarantorAddress;
  }
  if (data.university !== undefined) {
    updateData.university = data.university;
  }
  if (data.course !== undefined) {
    updateData.course = data.course;
  }
  if (data.yearOfStudy !== undefined) {
    updateData.yearOfStudy = data.yearOfStudy;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  const [tenant] = await db
    .update(tenantsSchema)
    .set(updateData)
    .where(eq(tenantsSchema.id, id))
    .returning();

  revalidatePath('/dashboard/tenants');
  revalidatePath(`/dashboard/tenants/${id}`);
  return tenant!;
}

// Delete a tenant
export async function deleteTenant(id: number): Promise<void> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Verify tenant belongs to one of our properties
  const ownedProperties = await db
    .select({ id: propertiesSchema.id })
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId));

  const ownedPropertyIds = ownedProperties.map(p => p.id);

  const [existingTenant] = await db
    .select()
    .from(tenantsSchema)
    .where(and(
      eq(tenantsSchema.id, id),
      ownedPropertyIds.length > 0
        ? inArray(tenantsSchema.propertyId, ownedPropertyIds)
        : undefined,
    ))
    .limit(1);

  if (!existingTenant) {
    throw new Error('Tenant not found');
  }

  await db
    .delete(tenantsSchema)
    .where(eq(tenantsSchema.id, id));

  revalidatePath('/dashboard/tenants');
}

export type TenantWithDetails = {
  tenant: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    roomId: number | null;
    leaseStart: Date | null;
    leaseEnd: Date | null;
    rentAmount: number | null;
    depositAmount: number | null;
    university: string | null;
    course: string | null;
    yearOfStudy: number | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    guarantorName: string | null;
    guarantorPhone: string | null;
    notes: string | null;
    createdAt: Date;
  };
  property: {
    id: number;
    name: string;
    address: string;
  } | null;
  issues: {
    id: number;
    title: string;
    description: string;
    category: string | null;
    status: string;
    priority: string | null;
    assignedTo: string | null;
    createdAt: Date;
  }[];
  stats: {
    totalIssues: number;
    activeIssues: number;
    resolvedIssues: number;
  };
};

export async function getTenantWithDetails(id: number): Promise<TenantWithDetails> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Get all property IDs owned by this user
  const ownedProperties = await db
    .select({ id: propertiesSchema.id })
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId));

  const ownedPropertyIds = ownedProperties.map(p => p.id);

  // Get tenant (only if they belong to one of our properties)
  const [tenant] = await db
    .select({
      id: tenantsSchema.id,
      name: tenantsSchema.name,
      email: tenantsSchema.email,
      phone: tenantsSchema.phone,
      roomId: tenantsSchema.roomId,
      leaseStart: tenantsSchema.leaseStart,
      leaseEnd: tenantsSchema.leaseEnd,
      rentAmount: tenantsSchema.rentAmount,
      depositAmount: tenantsSchema.depositAmount,
      university: tenantsSchema.university,
      course: tenantsSchema.course,
      yearOfStudy: tenantsSchema.yearOfStudy,
      emergencyContactName: tenantsSchema.emergencyContactName,
      emergencyContactPhone: tenantsSchema.emergencyContactPhone,
      guarantorName: tenantsSchema.guarantorName,
      guarantorPhone: tenantsSchema.guarantorPhone,
      notes: tenantsSchema.notes,
      createdAt: tenantsSchema.createdAt,
      propertyId: tenantsSchema.propertyId,
    })
    .from(tenantsSchema)
    .where(
      and(
        eq(tenantsSchema.id, id),
        ownedPropertyIds.length > 0
          ? inArray(tenantsSchema.propertyId, ownedPropertyIds)
          : undefined,
      ),
    )
    .limit(1);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Get property info if tenant has one
  let property = null;
  if (tenant.propertyId) {
    const [prop] = await db
      .select({
        id: propertiesSchema.id,
        name: propertiesSchema.name,
        address: propertiesSchema.address,
      })
      .from(propertiesSchema)
      .where(eq(propertiesSchema.id, tenant.propertyId))
      .limit(1);
    if (prop) {
      property = {
        id: prop.id,
        name: prop.name,
        address: prop.address ?? '',
      };
    }
  }

  // Get all issues for this tenant
  const issues = await db
    .select({
      id: issuesSchema.id,
      title: issuesSchema.title,
      description: issuesSchema.description,
      category: issuesSchema.category,
      status: issuesSchema.status,
      priority: issuesSchema.priority,
      assignedTo: issuesSchema.assignedTo,
      createdAt: issuesSchema.createdAt,
    })
    .from(issuesSchema)
    .where(eq(issuesSchema.tenantId, id))
    .orderBy(desc(issuesSchema.createdAt));

  const activeIssues = issues.filter(
    i => !['closed', 'resolved_by_agent'].includes(i.status),
  ).length;

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      roomId: tenant.roomId,
      leaseStart: tenant.leaseStart,
      leaseEnd: tenant.leaseEnd,
      rentAmount: tenant.rentAmount,
      depositAmount: tenant.depositAmount,
      university: tenant.university,
      course: tenant.course,
      yearOfStudy: tenant.yearOfStudy,
      emergencyContactName: tenant.emergencyContactName,
      emergencyContactPhone: tenant.emergencyContactPhone,
      guarantorName: tenant.guarantorName,
      guarantorPhone: tenant.guarantorPhone,
      notes: tenant.notes,
      createdAt: tenant.createdAt,
    },
    property,
    issues,
    stats: {
      totalIssues: issues.length,
      activeIssues,
      resolvedIssues: issues.length - activeIssues,
    },
  };
}

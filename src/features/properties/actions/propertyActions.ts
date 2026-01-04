'use server';

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/libs/DB';
import { issuesSchema, propertiesSchema, tenantsSchema } from '@/models/Schema';

import {
  propertyFormSchema,
  type PropertyFormValues,
  updatePropertySchema,
} from '../schemas/propertySchema';

// Helper to get current organization ID
async function getOwnerId(): Promise<string> {
  const { orgId, userId } = await auth();
  const ownerId = orgId ?? userId;
  if (!ownerId) {
    throw new Error('Unauthorized');
  }
  return ownerId;
}

// CREATE
export async function createProperty(data: PropertyFormValues) {
  const ownerId = await getOwnerId();
  const validated = propertyFormSchema.parse(data);

  const db = await getDb();
  const [property] = await db
    .insert(propertiesSchema)
    .values({
      ...validated,
      ownerId,
      notes: validated.notes || null,
      imageUrl: validated.imageUrl || null,
    })
    .returning();

  revalidatePath('/[locale]/dashboard/properties', 'page');
  return { success: true, data: property };
}

// READ (List with pagination and filtering)
export async function getProperties(options?: {
  status?: 'available' | 'occupied';
  search?: string;
  page?: number;
  limit?: number;
}) {
  const ownerId = await getOwnerId();
  const { status, search, page = 1, limit = 10 } = options ?? {};
  const offset = (page - 1) * limit;

  const db = await getDb();
  const conditions = [eq(propertiesSchema.ownerId, ownerId)];

  if (status) {
    conditions.push(eq(propertiesSchema.status, status));
  }

  if (search) {
    conditions.push(
      or(
        ilike(propertiesSchema.name, `%${search}%`),
        ilike(propertiesSchema.address, `%${search}%`),
      )!,
    );
  }

  const [properties, countResult] = await Promise.all([
    db
      .select()
      .from(propertiesSchema)
      .where(and(...conditions))
      .orderBy(desc(propertiesSchema.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(propertiesSchema)
      .where(and(...conditions)),
  ]);

  return {
    data: properties,
    pagination: {
      page,
      limit,
      total: Number(countResult[0]?.count ?? 0),
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    },
  };
}

// READ (Single)
export async function getProperty(id: number) {
  const ownerId = await getOwnerId();
  const db = await getDb();

  const [property] = await db
    .select()
    .from(propertiesSchema)
    .where(
      and(eq(propertiesSchema.id, id), eq(propertiesSchema.ownerId, ownerId)),
    )
    .limit(1);

  if (!property) {
    throw new Error('Property not found');
  }

  return property;
}

// UPDATE
export async function updateProperty(
  id: number,
  data: Partial<PropertyFormValues>,
) {
  const ownerId = await getOwnerId();
  const validated = updatePropertySchema.parse(data);
  const db = await getDb();

  const [property] = await db
    .update(propertiesSchema)
    .set({
      ...validated,
      notes: validated.notes || null,
      imageUrl: validated.imageUrl || null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(propertiesSchema.id, id), eq(propertiesSchema.ownerId, ownerId)),
    )
    .returning();

  if (!property) {
    throw new Error('Property not found or unauthorized');
  }

  revalidatePath('/[locale]/dashboard/properties', 'page');
  revalidatePath(`/[locale]/dashboard/properties/${id}`, 'page');
  return { success: true, data: property };
}

// DELETE
export async function deleteProperty(id: number) {
  const ownerId = await getOwnerId();
  const db = await getDb();

  const [deleted] = await db
    .delete(propertiesSchema)
    .where(
      and(eq(propertiesSchema.id, id), eq(propertiesSchema.ownerId, ownerId)),
    )
    .returning();

  if (!deleted) {
    throw new Error('Property not found or unauthorized');
  }

  revalidatePath('/[locale]/dashboard/properties', 'page');
  return { success: true };
}

// READ (Property with related data)
export async function getPropertyWithDetails(id: number) {
  const ownerId = await getOwnerId();
  const db = await getDb();

  const [property] = await db
    .select()
    .from(propertiesSchema)
    .where(
      and(eq(propertiesSchema.id, id), eq(propertiesSchema.ownerId, ownerId)),
    )
    .limit(1);

  if (!property) {
    throw new Error('Property not found');
  }

  // Get tenants for this property
  const tenants = await db
    .select({
      id: tenantsSchema.id,
      name: tenantsSchema.name,
      email: tenantsSchema.email,
      phone: tenantsSchema.phone,
      roomId: tenantsSchema.roomId,
      leaseStart: tenantsSchema.leaseStart,
      leaseEnd: tenantsSchema.leaseEnd,
      university: tenantsSchema.university,
    })
    .from(tenantsSchema)
    .where(eq(tenantsSchema.propertyId, id));

  // Get issues for this property
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
    .where(eq(issuesSchema.propertyId, id))
    .orderBy(desc(issuesSchema.createdAt))
    .limit(10);

  return {
    property,
    tenants,
    issues,
    stats: {
      tenantCount: tenants.length,
      activeIssueCount: issues.filter(i => !['closed', 'resolved_by_agent'].includes(i.status)).length,
      resolvedIssueCount: issues.filter(i => ['closed', 'resolved_by_agent'].includes(i.status)).length,
    },
  };
}

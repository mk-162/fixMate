'use server';

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, inArray } from 'drizzle-orm';

import { getDb } from '@/libs/DB';
import { issuesSchema, propertiesSchema, tenantsSchema } from '@/models/Schema';

async function getOwnerId(): Promise<string> {
  const { orgId, userId } = await auth();
  const ownerId = orgId ?? userId;
  if (!ownerId) {
    throw new Error('Unauthorized');
  }
  return ownerId;
}

export type TenantWithDetails = {
  tenant: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    roomNumber: string | null;
    moveInDate: Date | null;
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
      roomNumber: tenantsSchema.roomNumber,
      moveInDate: tenantsSchema.moveInDate,
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
      roomNumber: tenant.roomNumber,
      moveInDate: tenant.moveInDate,
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

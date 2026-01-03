'use server';

import { auth } from '@clerk/nextjs/server';
import { count, eq, inArray, sql } from 'drizzle-orm';

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

export type DashboardStats = {
  propertyCount: number;
  tenantCount: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  totalMonthlyRent: number;
  activeIssues: number;
  escalatedIssues: number;
  resolvedByAI: number;
  closedIssues: number;
  resolutionRate: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Get all properties for this owner
  const properties = await db
    .select({
      id: propertiesSchema.id,
      totalRooms: propertiesSchema.totalRooms,
      monthlyRent: propertiesSchema.monthlyRent,
      status: propertiesSchema.status,
    })
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId));

  const propertyIds = properties.map(p => p.id);
  const propertyCount = properties.length;
  const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);
  const occupiedRooms = properties
    .filter(p => p.status === 'occupied')
    .reduce((sum, p) => sum + (p.totalRooms || 0), 0);
  const totalMonthlyRent = properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);

  // Get tenant count
  let tenantCount = 0;
  if (propertyIds.length > 0) {
    const tenantResult = await db
      .select({ count: count() })
      .from(tenantsSchema)
      .where(inArray(tenantsSchema.propertyId, propertyIds));
    tenantCount = tenantResult[0]?.count ?? 0;
  }

  // Get issue stats
  let activeIssues = 0;
  let escalatedIssues = 0;
  let resolvedByAI = 0;
  let closedIssues = 0;

  if (propertyIds.length > 0) {
    const issueStats = await db
      .select({
        status: issuesSchema.status,
        count: count(),
      })
      .from(issuesSchema)
      .where(inArray(issuesSchema.propertyId, propertyIds))
      .groupBy(issuesSchema.status);

    for (const stat of issueStats) {
      const statusCount = stat.count;
      switch (stat.status) {
        case 'new':
        case 'triaging':
        case 'assigned':
        case 'in_progress':
        case 'awaiting_confirmation':
          activeIssues += statusCount;
          break;
        case 'escalated':
          activeIssues += statusCount;
          escalatedIssues = statusCount;
          break;
        case 'resolved_by_agent':
          resolvedByAI = statusCount;
          break;
        case 'closed':
          closedIssues = statusCount;
          break;
      }
    }
  }

  const totalResolved = resolvedByAI + closedIssues;
  const totalIssues = activeIssues + totalResolved;
  const resolutionRate = totalIssues > 0 ? Math.round((totalResolved / totalIssues) * 100) : 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return {
    propertyCount,
    tenantCount,
    totalRooms,
    occupiedRooms,
    occupancyRate,
    totalMonthlyRent,
    activeIssues,
    escalatedIssues,
    resolvedByAI,
    closedIssues,
    resolutionRate,
  };
}

export type PropertyWithStats = {
  id: number;
  name: string;
  address: string;
  totalRooms: number;
  monthlyRent: number;
  status: 'available' | 'occupied';
  tenantCount: number;
  activeIssueCount: number;
};

export async function getPropertiesWithStats(): Promise<PropertyWithStats[]> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Get properties with tenant and issue counts using subqueries
  const properties = await db
    .select({
      id: propertiesSchema.id,
      name: propertiesSchema.name,
      address: propertiesSchema.address,
      totalRooms: propertiesSchema.totalRooms,
      monthlyRent: propertiesSchema.monthlyRent,
      status: propertiesSchema.status,
      tenantCount: sql<number>`(
        SELECT COUNT(*) FROM tenants
        WHERE tenants.property_id = ${propertiesSchema.id}
      )`.as('tenant_count'),
      activeIssueCount: sql<number>`(
        SELECT COUNT(*) FROM issues
        WHERE issues.property_id = ${propertiesSchema.id}
        AND issues.status NOT IN ('closed', 'resolved_by_agent')
      )`.as('active_issue_count'),
    })
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId));

  return properties.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address ?? '',
    totalRooms: p.totalRooms,
    monthlyRent: p.monthlyRent,
    status: p.status,
    tenantCount: Number(p.tenantCount),
    activeIssueCount: Number(p.activeIssueCount),
  }));
}

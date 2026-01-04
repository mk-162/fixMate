'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray } from 'drizzle-orm';

import { getDb } from '@/libs/DB';
import { contractorsSchema, propertiesSchema, tenantsSchema } from '@/models/Schema';

async function getOwnerId(): Promise<string> {
  const { orgId, userId } = await auth();
  const ownerId = orgId ?? userId;
  if (!ownerId) {
    throw new Error('Unauthorized');
  }
  return ownerId;
}

export type PropertyOption = {
  id: number;
  name: string;
  address: string | null;
};

export type TenantOption = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  propertyId: number | null;
};

export type ContractorOption = {
  id: number;
  name: string;
  company: string | null;
  trade: string;
  phone: string | null;
  hourlyRate: number | null;
};

// Get all properties for dropdown
export async function getPropertiesForSelect(): Promise<PropertyOption[]> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  const properties = await db
    .select({
      id: propertiesSchema.id,
      name: propertiesSchema.name,
      address: propertiesSchema.address,
    })
    .from(propertiesSchema)
    .where(eq(propertiesSchema.ownerId, ownerId))
    .orderBy(propertiesSchema.name);

  return properties;
}

// Get tenants for dropdown, optionally filtered by property
export async function getTenantsForSelect(propertyId?: number): Promise<TenantOption[]> {
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

  // Build conditions - filter to owned properties only
  const conditions = [
    inArray(tenantsSchema.propertyId, ownedPropertyIds),
  ];

  // Filter by specific property if provided
  if (propertyId) {
    conditions.push(eq(tenantsSchema.propertyId, propertyId));
  }

  const tenants = await db
    .select({
      id: tenantsSchema.id,
      name: tenantsSchema.name,
      email: tenantsSchema.email,
      phone: tenantsSchema.phone,
      propertyId: tenantsSchema.propertyId,
    })
    .from(tenantsSchema)
    .where(and(...conditions))
    .orderBy(tenantsSchema.name);

  return tenants;
}

// Get contractors for dropdown, optionally filtered by trade
export async function getContractorsForSelect(category?: string): Promise<ContractorOption[]> {
  const ownerId = await getOwnerId();
  const db = await getDb();

  // Map issue categories to contractor trades
  const categoryToTrades: Record<string, string[]> = {
    plumbing: ['plumbing'],
    electrical: ['electrical'],
    appliance: ['appliance', 'electrical'],
    heating: ['heating', 'plumbing'],
    structural: ['carpentry', 'roofing', 'general'],
    pest: ['pest_control'],
    other: ['general', 'other'],
  };

  const conditions = [
    eq(contractorsSchema.organizationId, ownerId),
    eq(contractorsSchema.isActive, true),
  ];

  const contractors = await db
    .select({
      id: contractorsSchema.id,
      name: contractorsSchema.name,
      company: contractorsSchema.company,
      trade: contractorsSchema.trade,
      phone: contractorsSchema.phone,
      hourlyRate: contractorsSchema.hourlyRate,
    })
    .from(contractorsSchema)
    .where(and(...conditions))
    .orderBy(contractorsSchema.name);

  // If category specified, sort matching trades to the top
  if (category && categoryToTrades[category]) {
    const matchingTrades = categoryToTrades[category];
    return contractors.sort((a, b) => {
      const aMatches = matchingTrades.includes(a.trade);
      const bMatches = matchingTrades.includes(b.trade);
      if (aMatches && !bMatches) {
        return -1;
      }
      if (!aMatches && bMatches) {
        return 1;
      }
      return 0;
    });
  }

  return contractors;
}

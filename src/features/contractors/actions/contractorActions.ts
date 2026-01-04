'use server';

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/libs/DB';
import {
  contractorAssignmentsSchema,
  contractorsSchema,
  issuesSchema,
} from '@/models/Schema';

import {
  contractorAssignmentSchema,
  type ContractorAssignmentValues,
  contractorFormSchema,
  type ContractorFormValues,
  type ContractorTrade,
  updateContractorSchema,
} from '../schemas/contractorSchema';

// Helper to get current organization ID
async function getOrganizationId(): Promise<string> {
  const { orgId, userId } = await auth();
  const organizationId = orgId ?? userId;
  if (!organizationId) {
    throw new Error('Unauthorized');
  }
  return organizationId;
}

// CREATE
export async function createContractor(data: ContractorFormValues) {
  const organizationId = await getOrganizationId();
  const validated = contractorFormSchema.parse(data);

  const db = await getDb();
  const [contractor] = await db
    .insert(contractorsSchema)
    .values({
      ...validated,
      organizationId,
      company: validated.company || null,
      email: validated.email || null,
      phone: validated.phone || null,
      hourlyRate: validated.hourlyRate || null,
      notes: validated.notes || null,
    })
    .returning();

  revalidatePath('/[locale]/dashboard/contractors', 'page');
  return { success: true, data: contractor };
}

// READ (List with filtering)
export async function getContractors(options?: {
  trade?: ContractorTrade;
  search?: string;
  isActive?: number;
}) {
  const organizationId = await getOrganizationId();
  const { trade, search, isActive } = options ?? {};

  const db = await getDb();
  const conditions = [eq(contractorsSchema.organizationId, organizationId)];

  if (trade) {
    conditions.push(eq(contractorsSchema.trade, trade));
  }

  if (typeof isActive === 'number') {
    conditions.push(eq(contractorsSchema.isActive, isActive));
  }

  if (search) {
    conditions.push(
      or(
        ilike(contractorsSchema.name, `%${search}%`),
        ilike(contractorsSchema.company, `%${search}%`),
      )!,
    );
  }

  const contractors = await db
    .select()
    .from(contractorsSchema)
    .where(and(...conditions))
    .orderBy(desc(contractorsSchema.createdAt));

  return { data: contractors };
}

// READ (Single)
export async function getContractor(id: number) {
  const organizationId = await getOrganizationId();
  const db = await getDb();

  const [contractor] = await db
    .select()
    .from(contractorsSchema)
    .where(
      and(
        eq(contractorsSchema.id, id),
        eq(contractorsSchema.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!contractor) {
    throw new Error('Contractor not found');
  }

  return contractor;
}

// UPDATE
export async function updateContractor(
  id: number,
  data: Partial<ContractorFormValues>,
) {
  const organizationId = await getOrganizationId();
  const validated = updateContractorSchema.parse(data);
  const db = await getDb();

  const [contractor] = await db
    .update(contractorsSchema)
    .set({
      ...validated,
      company: validated.company || null,
      email: validated.email || null,
      phone: validated.phone || null,
      hourlyRate: validated.hourlyRate || null,
      notes: validated.notes || null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contractorsSchema.id, id),
        eq(contractorsSchema.organizationId, organizationId),
      ),
    )
    .returning();

  if (!contractor) {
    throw new Error('Contractor not found or unauthorized');
  }

  revalidatePath('/[locale]/dashboard/contractors', 'page');
  return { success: true, data: contractor };
}

// DELETE
export async function deleteContractor(id: number) {
  const organizationId = await getOrganizationId();
  const db = await getDb();

  const [deleted] = await db
    .delete(contractorsSchema)
    .where(
      and(
        eq(contractorsSchema.id, id),
        eq(contractorsSchema.organizationId, organizationId),
      ),
    )
    .returning();

  if (!deleted) {
    throw new Error('Contractor not found or unauthorized');
  }

  revalidatePath('/[locale]/dashboard/contractors', 'page');
  return { success: true };
}

// ASSIGN contractor to issue
export async function assignContractorToIssue(data: ContractorAssignmentValues) {
  const organizationId = await getOrganizationId();
  const validated = contractorAssignmentSchema.parse(data);
  const db = await getDb();

  // Verify contractor belongs to this organization
  const [contractor] = await db
    .select()
    .from(contractorsSchema)
    .where(
      and(
        eq(contractorsSchema.id, validated.contractorId),
        eq(contractorsSchema.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!contractor) {
    throw new Error('Contractor not found or unauthorized');
  }

  // Create assignment
  const [assignment] = await db
    .insert(contractorAssignmentsSchema)
    .values({
      issueId: validated.issueId,
      contractorId: validated.contractorId,
      scheduledFor: validated.scheduledFor || null,
      notes: validated.notes || null,
      quotedAmount: validated.quotedAmount || null,
    })
    .returning();

  // Update issue status and assignedTo
  await db
    .update(issuesSchema)
    .set({
      status: 'assigned',
      assignedTo: contractor.company
        ? `${contractor.name} (${contractor.company})`
        : contractor.name,
      updatedAt: new Date(),
    })
    .where(eq(issuesSchema.id, validated.issueId));

  revalidatePath('/[locale]/dashboard/pm-dashboard', 'page');
  revalidatePath(`/[locale]/dashboard/issues/${validated.issueId}`, 'page');

  return { success: true, data: assignment, contractor };
}

// GET assignment for an issue
export async function getIssueAssignment(issueId: number) {
  const db = await getDb();

  const [assignment] = await db
    .select({
      id: contractorAssignmentsSchema.id,
      issueId: contractorAssignmentsSchema.issueId,
      contractorId: contractorAssignmentsSchema.contractorId,
      assignedAt: contractorAssignmentsSchema.assignedAt,
      scheduledFor: contractorAssignmentsSchema.scheduledFor,
      completedAt: contractorAssignmentsSchema.completedAt,
      notes: contractorAssignmentsSchema.notes,
      quotedAmount: contractorAssignmentsSchema.quotedAmount,
      actualAmount: contractorAssignmentsSchema.actualAmount,
      // Contractor details
      contractorName: contractorsSchema.name,
      contractorCompany: contractorsSchema.company,
      contractorPhone: contractorsSchema.phone,
      contractorEmail: contractorsSchema.email,
      contractorTrade: contractorsSchema.trade,
    })
    .from(contractorAssignmentsSchema)
    .innerJoin(
      contractorsSchema,
      eq(contractorAssignmentsSchema.contractorId, contractorsSchema.id),
    )
    .where(eq(contractorAssignmentsSchema.issueId, issueId))
    .orderBy(desc(contractorAssignmentsSchema.assignedAt))
    .limit(1);

  return assignment || null;
}

// UPDATE assignment (e.g., mark completed, add actual cost)
export async function updateAssignment(
  id: number,
  data: {
    completedAt?: Date;
    actualAmount?: number;
    notes?: string;
  },
) {
  const db = await getDb();

  const [assignment] = await db
    .update(contractorAssignmentsSchema)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(contractorAssignmentsSchema.id, id))
    .returning();

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  revalidatePath('/[locale]/dashboard/pm-dashboard', 'page');
  return { success: true, data: assignment };
}

// Get contractors suitable for an issue category
export async function getContractorsForCategory(category: string) {
  const organizationId = await getOrganizationId();
  const db = await getDb();

  // Map issue categories to contractor trades
  const categoryToTrade: Record<string, ContractorTrade[]> = {
    plumbing: ['plumbing'],
    electrical: ['electrical'],
    appliance: ['appliance', 'electrical'],
    heating: ['heating', 'plumbing'],
    structural: ['carpentry', 'roofing', 'general'],
    security: ['locksmith'],
    general: ['general'],
    other: ['general', 'other'],
  };

  const trades = categoryToTrade[category] || ['general'];

  const contractors = await db
    .select()
    .from(contractorsSchema)
    .where(
      and(
        eq(contractorsSchema.organizationId, organizationId),
        eq(contractorsSchema.isActive, 1),
        or(...trades.map(t => eq(contractorsSchema.trade, t)))!,
      ),
    )
    .orderBy(contractorsSchema.name);

  return { data: contractors };
}

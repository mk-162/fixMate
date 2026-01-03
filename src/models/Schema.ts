import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// Need a database for production? Check out https://www.prisma.io/?via=saasboilerplatesrc
// Tested and compatible with Next.js Boilerplate
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Property status enum for HMO properties
export const propertyStatusEnum = pgEnum('property_status', [
  'available',
  'occupied',
]);

// HMO Properties table for student housing management
export const propertiesSchema = pgTable(
  'properties',
  {
    id: serial('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    name: text('name').notNull(),
    address: text('address').notNull(),
    totalRooms: integer('total_rooms').notNull(),
    monthlyRent: integer('monthly_rent').notNull(),
    status: propertyStatusEnum('status').notNull().default('available'),
    notes: text('notes'),
    imageUrl: text('image_url'),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      ownerIdIdx: index('properties_owner_id_idx').on(table.ownerId),
      statusIdx: index('properties_status_idx').on(table.status),
    };
  },
);

// Type exports for Properties
export type Property = typeof propertiesSchema.$inferSelect;
export type NewProperty = typeof propertiesSchema.$inferInsert;

// ============================================
// FIXMATE MVP SCHEMA
// ============================================

// User roles enum
export const userRoleEnum = pgEnum('user_role', [
  'tenant',
  'property_manager',
  'landlord',
]);

// Issue status enum
export const issueStatusEnum = pgEnum('issue_status', [
  'new', // Just submitted
  'triaging', // Agent is asking questions
  'resolved_by_agent', // Agent helped tenant fix it themselves
  'escalated', // Needs professional attention
  'assigned', // Tradesperson assigned
  'in_progress', // Work in progress
  'awaiting_confirmation', // Waiting for tenant to confirm fixed
  'closed', // Fully resolved
]);

// Issue priority enum
export const issuePriorityEnum = pgEnum('issue_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

// Tenants table - people living in properties
export const tenantsSchema = pgTable(
  'tenants',
  {
    id: serial('id').primaryKey(),
    clerkUserId: text('clerk_user_id').notNull().unique(),
    propertyId: integer('property_id').references(() => propertiesSchema.id),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    roomNumber: text('room_number'),
    moveInDate: timestamp('move_in_date', { mode: 'date' }),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      clerkUserIdIdx: uniqueIndex('tenants_clerk_user_id_idx').on(table.clerkUserId),
      propertyIdIdx: index('tenants_property_id_idx').on(table.propertyId),
    };
  },
);

// Issues table - maintenance requests
export const issuesSchema = pgTable(
  'issues',
  {
    id: serial('id').primaryKey(),
    tenantId: integer('tenant_id').references(() => tenantsSchema.id).notNull(),
    propertyId: integer('property_id').references(() => propertiesSchema.id).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category'), // e.g., 'appliance', 'plumbing', 'electrical'
    status: issueStatusEnum('status').notNull().default('new'),
    priority: issuePriorityEnum('priority').default('medium'),
    resolvedByAgent: text('resolved_by_agent'), // If agent solved it, how?
    assignedTo: text('assigned_to'), // Tradesperson name/company if escalated
    followUpDate: timestamp('follow_up_date', { mode: 'date' }),
    closedAt: timestamp('closed_at', { mode: 'date' }),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      tenantIdIdx: index('issues_tenant_id_idx').on(table.tenantId),
      propertyIdIdx: index('issues_property_id_idx').on(table.propertyId),
      statusIdx: index('issues_status_idx').on(table.status),
    };
  },
);

// Issue messages - conversation between agent/tenant/PM
export const issueMessagesSchema = pgTable(
  'issue_messages',
  {
    id: serial('id').primaryKey(),
    issueId: integer('issue_id').references(() => issuesSchema.id).notNull(),
    role: text('role').notNull(), // 'tenant', 'agent', 'property_manager', 'system'
    content: text('content').notNull(),
    metadata: text('metadata'), // JSON string for extra data (e.g., agent reasoning)
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      issueIdIdx: index('issue_messages_issue_id_idx').on(table.issueId),
    };
  },
);

// Agent activity log - tracks what the agent did
export const agentActivitySchema = pgTable(
  'agent_activity',
  {
    id: serial('id').primaryKey(),
    issueId: integer('issue_id').references(() => issuesSchema.id),
    action: text('action').notNull(), // e.g., 'asked_question', 'suggested_fix', 'escalated'
    details: text('details'), // JSON with action details
    wouldNotify: text('would_notify'), // Who would be notified in production
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      issueIdIdx: index('agent_activity_issue_id_idx').on(table.issueId),
    };
  },
);

// Type exports for FixMate
export type Tenant = typeof tenantsSchema.$inferSelect;
export type NewTenant = typeof tenantsSchema.$inferInsert;
export type Issue = typeof issuesSchema.$inferSelect;
export type NewIssue = typeof issuesSchema.$inferInsert;
export type IssueMessage = typeof issueMessagesSchema.$inferSelect;
export type NewIssueMessage = typeof issueMessagesSchema.$inferInsert;
export type AgentActivity = typeof agentActivitySchema.$inferSelect;
export type NewAgentActivity = typeof agentActivitySchema.$inferInsert;

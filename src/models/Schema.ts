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

// Property type enum
export const propertyTypeEnum = pgEnum('property_type', [
  'hmo',
  'single_let',
  'studio',
]);

// EPC rating enum
export const epcRatingEnum = pgEnum('epc_rating', [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
]);

// Council tax band enum
export const councilTaxBandEnum = pgEnum('council_tax_band', [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
]);

// Heating type enum
export const heatingTypeEnum = pgEnum('heating_type', [
  'gas',
  'electric',
  'oil',
  'heat_pump',
  'other',
]);

// Room status enum
export const roomStatusEnum = pgEnum('room_status', [
  'available',
  'occupied',
  'maintenance',
]);

// Deposit scheme enum
export const depositSchemeEnum = pgEnum('deposit_scheme', [
  'DPS',
  'TDS',
  'MyDeposits',
]);

// Document type enum
export const documentTypeEnum = pgEnum('document_type', [
  'gas_cert',
  'eicr',
  'epc',
  'hmo_license',
  'inventory',
  'contract',
  'deposit_cert',
  'photo',
  'other',
]);

// Contractor trade enum
export const contractorTradeEnum = pgEnum('contractor_trade', [
  'plumbing',
  'electrical',
  'heating',
  'appliance',
  'locksmith',
  'carpentry',
  'roofing',
  'glazing',
  'cleaning',
  'gardening',
  'pest_control',
  'general',
  'other',
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
    // HMO-specific fields
    propertyType: propertyTypeEnum('property_type').default('hmo'),
    licenseNumber: text('license_number'),
    licenseExpiry: timestamp('license_expiry', { mode: 'date' }),
    epcRating: epcRatingEnum('epc_rating'),
    epcExpiry: timestamp('epc_expiry', { mode: 'date' }),
    gasCertExpiry: timestamp('gas_cert_expiry', { mode: 'date' }),
    electricalCertExpiry: timestamp('electrical_cert_expiry', { mode: 'date' }),
    councilTaxBand: councilTaxBandEnum('council_tax_band'),
    heatingType: heatingTypeEnum('heating_type'),
    furnished: integer('furnished').default(1), // 1 = true, 0 = false
    hasParking: integer('has_parking').default(0),
    hasGarden: integer('has_garden').default(0),
    wifiIncluded: integer('wifi_included').default(0),
    billsIncluded: integer('bills_included').default(0),
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

// Rooms table - individual lettable units within HMO properties
export const roomsSchema = pgTable(
  'rooms',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').references(() => propertiesSchema.id).notNull(),
    roomName: text('room_name').notNull(), // 'Room 1', 'Attic Room', etc.
    floor: integer('floor').default(0), // 0 = ground, 1 = first, etc.
    sizeSqm: integer('size_sqm'),
    monthlyRent: integer('monthly_rent').notNull(),
    depositAmount: integer('deposit_amount'),
    hasEnsuite: integer('has_ensuite').default(0),
    furnished: integer('furnished').default(1),
    status: roomStatusEnum('status').notNull().default('available'),
    notes: text('notes'),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      propertyIdIdx: index('rooms_property_id_idx').on(table.propertyId),
      statusIdx: index('rooms_status_idx').on(table.status),
    };
  },
);

// Type exports for Rooms
export type Room = typeof roomsSchema.$inferSelect;
export type NewRoom = typeof roomsSchema.$inferInsert;

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

// Tenants table - students living in rooms
export const tenantsSchema = pgTable(
  'tenants',
  {
    id: serial('id').primaryKey(),
    clerkUserId: text('clerk_user_id').unique(),
    // Link to room (room links to property)
    roomId: integer('room_id').references(() => roomsSchema.id),
    propertyId: integer('property_id').references(() => propertiesSchema.id), // Kept for backwards compatibility
    // Basic info
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    // Lease details
    leaseStart: timestamp('lease_start', { mode: 'date' }),
    leaseEnd: timestamp('lease_end', { mode: 'date' }),
    rentAmount: integer('rent_amount'),
    depositAmount: integer('deposit_amount'),
    depositScheme: depositSchemeEnum('deposit_scheme'),
    depositReference: text('deposit_reference'),
    // Emergency contact
    emergencyContactName: text('emergency_contact_name'),
    emergencyContactPhone: text('emergency_contact_phone'),
    emergencyContactRelation: text('emergency_contact_relation'),
    // Guarantor (important for students)
    guarantorName: text('guarantor_name'),
    guarantorEmail: text('guarantor_email'),
    guarantorPhone: text('guarantor_phone'),
    guarantorAddress: text('guarantor_address'),
    // Student info
    university: text('university'),
    course: text('course'),
    yearOfStudy: integer('year_of_study'),
    // Status
    isActive: integer('is_active').default(1),
    notes: text('notes'),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      clerkUserIdIdx: uniqueIndex('tenants_clerk_user_id_idx').on(table.clerkUserId),
      roomIdIdx: index('tenants_room_id_idx').on(table.roomId),
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

// Documents table - certificates, contracts, inventories, photos
export const documentsSchema = pgTable(
  'documents',
  {
    id: serial('id').primaryKey(),
    // Can be linked to property, room, or tenant
    propertyId: integer('property_id').references(() => propertiesSchema.id),
    roomId: integer('room_id').references(() => roomsSchema.id),
    tenantId: integer('tenant_id').references(() => tenantsSchema.id),
    // Document info
    type: documentTypeEnum('type').notNull(),
    name: text('name').notNull(),
    fileUrl: text('file_url'),
    expiryDate: timestamp('expiry_date', { mode: 'date' }),
    notes: text('notes'),
    uploadedAt: timestamp('uploaded_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      propertyIdIdx: index('documents_property_id_idx').on(table.propertyId),
      roomIdIdx: index('documents_room_id_idx').on(table.roomId),
      tenantIdIdx: index('documents_tenant_id_idx').on(table.tenantId),
      typeIdx: index('documents_type_idx').on(table.type),
    };
  },
);

// Type exports for Documents
export type Document = typeof documentsSchema.$inferSelect;
export type NewDocument = typeof documentsSchema.$inferInsert;

// Contractors table - tradespeople directory per organization
export const contractorsSchema = pgTable(
  'contractors',
  {
    id: serial('id').primaryKey(),
    organizationId: text('organization_id').notNull(), // Clerk org ID
    // Basic info
    name: text('name').notNull(),
    company: text('company'),
    email: text('email'),
    phone: text('phone'),
    // Trade/specialty
    trade: contractorTradeEnum('trade').notNull(),
    // Business details
    hourlyRate: integer('hourly_rate'), // In pence
    notes: text('notes'),
    // Status
    isActive: integer('is_active').default(1),
    // Timestamps
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      organizationIdIdx: index('contractors_organization_id_idx').on(table.organizationId),
      tradeIdx: index('contractors_trade_idx').on(table.trade),
    };
  },
);

// Type exports for Contractors
export type Contractor = typeof contractorsSchema.$inferSelect;
export type NewContractor = typeof contractorsSchema.$inferInsert;

// Contractor assignments - links contractors to issues
export const contractorAssignmentsSchema = pgTable(
  'contractor_assignments',
  {
    id: serial('id').primaryKey(),
    issueId: integer('issue_id').references(() => issuesSchema.id).notNull(),
    contractorId: integer('contractor_id').references(() => contractorsSchema.id).notNull(),
    // Assignment details
    assignedAt: timestamp('assigned_at', { mode: 'date' }).defaultNow().notNull(),
    scheduledFor: timestamp('scheduled_for', { mode: 'date' }),
    completedAt: timestamp('completed_at', { mode: 'date' }),
    // Cost tracking
    notes: text('notes'),
    quotedAmount: integer('quoted_amount'), // In pence
    actualAmount: integer('actual_amount'), // In pence
    // Timestamps
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      issueIdIdx: index('contractor_assignments_issue_id_idx').on(table.issueId),
      contractorIdIdx: index('contractor_assignments_contractor_id_idx').on(table.contractorId),
    };
  },
);

// Type exports for Contractor Assignments
export type ContractorAssignment = typeof contractorAssignmentsSchema.$inferSelect;
export type NewContractorAssignment = typeof contractorAssignmentsSchema.$inferInsert;

// Type exports for FixMate
export type Tenant = typeof tenantsSchema.$inferSelect;
export type NewTenant = typeof tenantsSchema.$inferInsert;
export type Issue = typeof issuesSchema.$inferSelect;
export type NewIssue = typeof issuesSchema.$inferInsert;
export type IssueMessage = typeof issueMessagesSchema.$inferSelect;
export type NewIssueMessage = typeof issueMessagesSchema.$inferInsert;
export type AgentActivity = typeof agentActivitySchema.$inferSelect;
export type NewAgentActivity = typeof agentActivitySchema.$inferInsert;

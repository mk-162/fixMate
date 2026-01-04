import { z } from 'zod';

export const depositSchemeOptions = ['DPS', 'TDS', 'MyDeposits'] as const;

export const tenantFormSchema = z.object({
  // Basic info
  name: z.string().min(1, 'Name is required').max(256),
  email: z.string().email('Invalid email').max(256),
  phone: z.string().max(50).optional().nullable(),

  // Room & Property assignment
  propertyId: z.coerce.number().optional().nullable(),
  roomId: z.coerce.number().optional().nullable(),

  // Lease details
  leaseStart: z.coerce.date().optional().nullable(),
  leaseEnd: z.coerce.date().optional().nullable(),
  rentAmount: z.coerce.number().min(0).optional().nullable(),
  depositAmount: z.coerce.number().min(0).optional().nullable(),
  depositScheme: z.enum(depositSchemeOptions).optional().nullable(),
  depositReference: z.string().max(100).optional().nullable(),

  // Emergency contact
  emergencyContactName: z.string().max(256).optional().nullable(),
  emergencyContactPhone: z.string().max(50).optional().nullable(),
  emergencyContactRelation: z.string().max(100).optional().nullable(),

  // Guarantor
  guarantorName: z.string().max(256).optional().nullable(),
  guarantorEmail: z.string().email().max(256).optional().or(z.literal('')).nullable(),
  guarantorPhone: z.string().max(50).optional().nullable(),
  guarantorAddress: z.string().max(500).optional().nullable(),

  // Student info
  university: z.string().max(256).optional().nullable(),
  course: z.string().max(256).optional().nullable(),
  yearOfStudy: z.coerce.number().min(1).max(10).optional().nullable(),

  // Other
  notes: z.string().max(2000).optional().nullable(),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

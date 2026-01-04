import { z } from 'zod';

// Trade options for contractors
export const contractorTrades = [
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
] as const;

export type ContractorTrade = (typeof contractorTrades)[number];

// Trade display labels
export const tradeLabels: Record<ContractorTrade, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  heating: 'Heating & Gas',
  appliance: 'Appliance Repair',
  locksmith: 'Locksmith',
  carpentry: 'Carpentry',
  roofing: 'Roofing',
  glazing: 'Glazing & Windows',
  cleaning: 'Cleaning',
  gardening: 'Gardening',
  pest_control: 'Pest Control',
  general: 'General Maintenance',
  other: 'Other',
};

// Base contractor form schema
export const contractorFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(256),
  company: z.string().max(256).optional().or(z.literal('')),
  email: z.string().email('Invalid email').max(256).optional().or(z.literal('')),
  phone: z.string().max(32).optional().or(z.literal('')),
  trade: z.enum(contractorTrades, {
    required_error: 'Trade is required',
  }),
  hourlyRate: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  isActive: z.coerce.number().int().min(0).max(1).default(1),
});

export type ContractorFormValues = z.infer<typeof contractorFormSchema>;

// Schema for creating contractor (server-side with organizationId)
export const createContractorSchema = contractorFormSchema.extend({
  organizationId: z.string().min(1),
});

// Schema for updating contractor (all fields optional)
export const updateContractorSchema = contractorFormSchema.partial();

// Schema for contractor assignment
export const contractorAssignmentSchema = z.object({
  issueId: z.coerce.number().int().positive(),
  contractorId: z.coerce.number().int().positive(),
  scheduledFor: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  quotedAmount: z.coerce.number().int().min(0).optional().nullable(),
});

export type ContractorAssignmentValues = z.infer<typeof contractorAssignmentSchema>;

// Schema for filtering contractors
export const contractorFilterSchema = z.object({
  trade: z.enum(contractorTrades).optional(),
  search: z.string().optional(),
  isActive: z.coerce.number().int().min(0).max(1).optional(),
});

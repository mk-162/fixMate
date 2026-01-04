import { z } from 'zod';

// Property status options matching the database enum
export const propertyStatusOptions = ['available', 'occupied'] as const;
export type PropertyStatus = (typeof propertyStatusOptions)[number];

// Property type options
export const propertyTypeOptions = ['hmo', 'single_let', 'studio'] as const;
export type PropertyType = (typeof propertyTypeOptions)[number];

// EPC rating options
export const epcRatingOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type EpcRating = (typeof epcRatingOptions)[number];

// Council tax band options
export const councilTaxBandOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type CouncilTaxBand = (typeof councilTaxBandOptions)[number];

// Heating type options
export const heatingTypeOptions = ['gas', 'electric', 'oil', 'heat_pump', 'other'] as const;
export type HeatingType = (typeof heatingTypeOptions)[number];

// Base schema for property form validation
export const propertyFormSchema = z.object({
  // Basic Info
  name: z
    .string()
    .min(1, 'Property name is required')
    .max(256, 'Property name must be less than 256 characters'),

  address: z
    .string()
    .min(1, 'Address is required')
    .max(512, 'Address must be less than 512 characters'),

  propertyType: z.enum(propertyTypeOptions).default('hmo'),

  totalRooms: z.coerce
    .number()
    .int('Total rooms must be a whole number')
    .min(1, 'Property must have at least 1 room')
    .max(100, 'Total rooms cannot exceed 100'),

  monthlyRent: z.coerce
    .number()
    .int('Monthly rent must be a whole number')
    .min(0, 'Monthly rent cannot be negative')
    .max(100000, 'Monthly rent seems too high'),

  status: z.enum(propertyStatusOptions, {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),

  // Compliance & Certificates
  licenseNumber: z
    .string()
    .max(100, 'License number must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  licenseExpiry: z.coerce.date().optional().nullable(),

  epcRating: z.enum(epcRatingOptions).optional().nullable(),

  epcExpiry: z.coerce.date().optional().nullable(),

  gasCertExpiry: z.coerce.date().optional().nullable(),

  electricalCertExpiry: z.coerce.date().optional().nullable(),

  councilTaxBand: z.enum(councilTaxBandOptions).optional().nullable(),

  // Property Features
  heatingType: z.enum(heatingTypeOptions).optional().nullable(),

  furnished: z.coerce.number().min(0).max(1).default(1),

  hasParking: z.coerce.number().min(0).max(1).default(0),

  hasGarden: z.coerce.number().min(0).max(1).default(0),

  wifiIncluded: z.coerce.number().min(0).max(1).default(0),

  billsIncluded: z.coerce.number().min(0).max(1).default(0),

  // Other
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .or(z.literal('')),

  imageUrl: z
    .string()
    .url('Please enter a valid URL')
    .max(1024, 'Image URL must be less than 1024 characters')
    .optional()
    .or(z.literal('')),
});

// Type inference from schema
export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

// Schema for server-side with ownerId
export const createPropertySchema = propertyFormSchema.extend({
  ownerId: z.string().min(1),
});

// Schema for partial updates
export const updatePropertySchema = propertyFormSchema.partial();

// Schema for filtering/querying
export const propertyFilterSchema = z.object({
  status: z.enum(propertyStatusOptions).optional(),
  propertyType: z.enum(propertyTypeOptions).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

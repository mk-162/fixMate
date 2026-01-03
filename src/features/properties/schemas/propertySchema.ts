import { z } from 'zod';

// Property status options matching the database enum
export const propertyStatusOptions = ['available', 'occupied'] as const;
export type PropertyStatus = (typeof propertyStatusOptions)[number];

// Base schema for property form validation
export const propertyFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Property name is required')
    .max(256, 'Property name must be less than 256 characters'),

  address: z
    .string()
    .min(1, 'Address is required')
    .max(512, 'Address must be less than 512 characters'),

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
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

import { z } from 'zod';

export const roomStatusOptions = ['available', 'occupied', 'maintenance'] as const;

export const floorOptions = [
  { value: -1, label: 'Basement' },
  { value: 0, label: 'Ground Floor' },
  { value: 1, label: 'First Floor' },
  { value: 2, label: 'Second Floor' },
  { value: 3, label: 'Third Floor' },
  { value: 4, label: 'Attic' },
] as const;

export const roomFormSchema = z.object({
  roomName: z.string().min(1, 'Room name is required').max(100),
  floor: z.coerce.number().min(-1).max(10).default(0),
  sizeSqm: z.coerce.number().min(1).max(200).optional().nullable(),
  monthlyRent: z.coerce.number().min(0, 'Rent must be positive'),
  depositAmount: z.coerce.number().min(0).optional().nullable(),
  hasEnsuite: z.boolean().default(false),
  furnished: z.boolean().default(true),
  status: z.enum(roomStatusOptions).default('available'),
  notes: z.string().max(1000).optional().nullable(),
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;

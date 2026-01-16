import { z } from 'zod';

export const createDealSchema = z.object({
  businessId: z.number().int().positive(),
  offerAmount: z.number().positive(),
  message: z.string().optional(),
});

export const updateDealStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'cancelled']),
});

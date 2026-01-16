import { z } from 'zod';

export const createBusinessSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  price: z.number().positive(),
  location: z.string().min(2),
  category: z.string().min(2),
});

export const updateBusinessSchema = createBusinessSchema.partial();

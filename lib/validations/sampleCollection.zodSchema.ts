import { z } from 'zod';

export const sampeCollectionZodSchema = z.object({
    name: z.string(),
    email: z.string().email(),
});

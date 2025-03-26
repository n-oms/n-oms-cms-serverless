import { z } from 'zod';

export const CountSchemas = {
    GetCount: z.object({
        tenantInfo: z.object({
            tenantId: z.string(),
            databaseUrl: z.string(),
        }),
        targetCollection: z.string(),
        filter: z.record(z.unknown()).optional(),
    }),
};
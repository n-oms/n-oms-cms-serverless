import { z } from 'zod';

export const StoreApiSchemas = {
    ReadData: z.object({
        tenantInfo: z.object({
            tenantId: z.string(),
            databaseUrl: z.string(),
        }),
        targetCollection: z.string(),
        filter: z.record(z.unknown()).optional(),
    }),
    CreateData: z.object({
        tenantInfo: z.object({
            tenantId: z.string(),
            databaseUrl: z.string(),
        }),
        targetCollection: z.string(),
        data: z.record(z.unknown()),
        addToBackOffice: z.boolean().optional(),
    }),
    UpdateData: z.object({
        tenantInfo: z.object({
            tenantId: z.string(),
            databaseUrl: z.string(),
        }),
        targetCollection: z.string(),
        data: z.record(z.unknown()),
        filter: z.record(z.unknown()),
    }),
};

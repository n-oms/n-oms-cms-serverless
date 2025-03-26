import { z } from 'zod';

export const AggregationSchemas = {
    AccumulateData: z.object({
        tenantInfo: z.object({
            tenantId: z.string(),
            databaseUrl: z.string(),
        }),
        targetCollection: z.string(),
        property: z.string(),
        filter: z.record(z.unknown()).optional(),
    }),
};
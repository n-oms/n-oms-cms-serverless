import { z } from 'zod';

export const ProjectionSchemas = {
    GetProjection: z.object({
        tenantInfo: z.object({
            tenantId: z.string(),
            databaseUrl: z.string(),
        }),
        targetCollection: z.string(),
        properties: z.array(z.string()),
        filter: z.record(z.unknown()).optional(),
    }),
};
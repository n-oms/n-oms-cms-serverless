import { z } from 'zod';

export enum ProjectionActions {
    GET_PROJECTION = 'GET_PROJECTION',
}

export const projectionBodySchema = z.object({
    action: z.nativeEnum(ProjectionActions),
    targetCollection: z.string(),
    properties: z.array(z.string()),
    filter: z.record(z.unknown()).optional(),
    tenantId: z.string(),
});

export type ProjectionApiBody = z.infer<typeof projectionBodySchema>;

export type ProjectionResult = {
    data: Record<string, any>[];
};
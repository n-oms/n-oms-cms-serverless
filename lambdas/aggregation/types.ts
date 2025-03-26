import { z } from 'zod';

export enum AggregationActions {
    ACCUMULATE = 'ACCUMULATE',
}

export const aggregationBodySchema = z.object({
    action: z.nativeEnum(AggregationActions),
    targetCollection: z.string(),
    property: z.string(),
    filter: z.record(z.unknown()).optional(),
    tenantId: z.string(),
});

export type AggregationApiBody = z.infer<typeof aggregationBodySchema>;

export type AccumulationResult = {
    sum: number;
    count: number;
    matchedCount: number;
    averageValue: number;
};
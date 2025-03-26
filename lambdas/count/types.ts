import { z } from 'zod';

export enum CountActions {
    GET_COUNT = 'GET_COUNT',
}

export const countBodySchema = z.object({
    action: z.nativeEnum(CountActions),
    targetCollection: z.string(),
    filter: z.record(z.unknown()).optional(),
    tenantId: z.string(),
});

export type CountApiBody = z.infer<typeof countBodySchema>;

export type CountResult = {
    count: number;
};
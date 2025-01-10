import { z } from 'zod';

export enum CrudApiActions {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export const crudApiBodySchema = z.object({
    action: z.nativeEnum(CrudApiActions),
    data: z.unknown(),
    isDataValidationRequired: z.boolean().optional(),
    tenantId: z.string(),
    targetCollection: z.string(),
});

export type CrudApiBody = z.infer<typeof crudApiBodySchema>;

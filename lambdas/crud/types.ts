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
    filter: z.record(z.unknown()).optional(),
    updateCmsUser: z.boolean().optional(),
    cmsUserUpdationInfo: z
        .object({
            email: z.string(),
            data: z.record(z.unknown()),
        })
        .optional(),
});

export type CrudApiBody = z.infer<typeof crudApiBodySchema>;

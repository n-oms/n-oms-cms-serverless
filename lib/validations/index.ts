import { z } from 'zod';
import { sampeCollectionZodSchema } from './sampleCollection.zodSchema';
import { TenantStoreAdminActions, TenantStoreApiActions } from '../types';

export const zodSchemas = {
    sampleCollection: sampeCollectionZodSchema,
};

export const TenantStoreApiBodySchema = z.object({
    action: z.nativeEnum(TenantStoreApiActions),
    data: z.unknown(),
    tenantId: z.string(),
    targetCollection: z.string(),
    filter: z.record(z.unknown()).optional(),
});

export const TenantStoreAdminApiBodySchema = z.object({
    action: z.nativeEnum(TenantStoreAdminActions),
    data: z.any().optional(),
});

export const CreateTenantApiBodySchema = z.object({
    data: z.object({
        tenantId: z.string(),
        tenantName: z.string(),
        databaseUrl: z.string(),
    }),
});

import { Logger } from '@aws-lambda-powertools/logger';

export type CreateInTargetDbInput = {
    targetCollection: string;
    data: unknown;
    isDataValidationRequired?: boolean;
    logger: Logger;
    tenantId: string;
    targetDatabaseUrl?: string;
    updateCmsUser?: boolean;
    cmsUserUpdationInfo?: {
        email: string;
        data: Record<string, unknown>;
    };
};

export type UpdateItemInTargetDbInput = {
    targetCollection: string;
    data: Record<string, unknown>;
    filter: Record<string, unknown>;
    isDataValidationRequired?: boolean;
    logger: Logger;
    tenantId: string;
    targetDatabaseUrl?: string;
    updateCmsUser?: boolean;
    cmsUserUpdationInfo?: {
        email: string;
        data: Record<string, unknown>;
    };
};

export type ReadItemFromTargetDB = {
    targetCollection: string;
    filter: Record<string, unknown>;
    logger: Logger;
    tenantId: string;
    tenantDatabaseUrl: string;
};

export type DeletItemFromTargetDb = {
    targetCollection: string;
    filter: Record<string, unknown>;
    logger: Logger;
    tenantId: string;
    targetDatabaseUrl: string;
};

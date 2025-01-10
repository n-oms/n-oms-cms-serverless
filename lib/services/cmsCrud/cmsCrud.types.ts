import { Logger } from '@aws-lambda-powertools/logger';

export type CreateInTargetDbInput = {
    targetCollection: string;
    data: unknown;
    isDataValidationRequired?: boolean;
    logger: Logger;
    tenantId: string;
};

export type UpdateItemInTargetDbInput = {
    targetCollection: string;
    data: Record<string, unknown>;
    filter: Record<string, unknown>;
    isDataValidationRequired?: boolean;
    logger: Logger;
    tenantId: string;
};

import { Logger } from '@aws-lambda-powertools/logger';

export type CreateInTargetDbInput = {
    targetCollection: string;
    data: unknown;
    isDataValidationRequired?: boolean;
    logger: Logger;
    tenantId: string;
};

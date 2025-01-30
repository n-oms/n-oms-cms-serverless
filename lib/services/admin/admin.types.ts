import { Logger } from '@aws-lambda-powertools/logger';

export type CreateTenant = {
    tenantId: string;
    tenantName: string;
    databaseUrl: string;
    logger: Logger;
};

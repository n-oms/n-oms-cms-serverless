import { Logger } from '@aws-lambda-powertools/logger';
import { TenantConfig } from '../../types';

export type ReadData = {
    tenantInfo: TenantConfig;
    targetCollection: string;
    filter?: Record<string, any>;
    logger: Logger;
};

import { Logger } from '@aws-lambda-powertools/logger';
import { TenantConfig } from '../../types';

export type GetCountInput = {
    tenantInfo: TenantConfig;
    targetCollection: string;
    filter?: Record<string, any>;
    logger: Logger;
};

export type CountResult = {
    count: number;
};
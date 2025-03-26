import { Logger } from '@aws-lambda-powertools/logger';
import { TenantConfig } from '../../types';

export type AccumulatePropertyInput = {
    tenantInfo: TenantConfig;
    targetCollection: string;
    property: string;
    filter?: Record<string, any>;
    logger: Logger;
};

export type AccumulationResult = {
    sum: number;
    count: number;
    matchedCount: number;
    averageValue: number;
};
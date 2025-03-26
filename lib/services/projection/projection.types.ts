import { Logger } from '@aws-lambda-powertools/logger';
import { TenantConfig } from '../../types';

export type GetProjectionInput = {
    tenantInfo: TenantConfig;
    targetCollection: string;
    properties: string[];
    filter?: Record<string, any>;
    logger: Logger;
};

export type ProjectionResult = {
    data: Record<string, any>[];
};
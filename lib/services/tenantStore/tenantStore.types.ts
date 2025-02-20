import { Logger } from '@aws-lambda-powertools/logger';
import { TenantConfig } from '../../types';

export type ReadData = {
    tenantInfo: TenantConfig;
    targetCollection: string;
    filter?: Record<string, any>;
    logger: Logger;
};

export type CreateData = {
    tenantInfo: TenantConfig;
    targetCollection: string;
    data: Record<string, any>;
    logger: Logger;
    addToBackOffice?: boolean;
};

export type UpdateData = {
    tenantInfo: TenantConfig;
    targetCollection: string;
    data: Record<string, any>;
    filter: Record<string, any>;
    logger: Logger;
    addToBackOffice?: boolean;
};

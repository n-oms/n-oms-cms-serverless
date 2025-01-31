import { Logger } from '@aws-lambda-powertools/logger';
import { CmsTenantRegistry } from '../../dynamodb/models/cms-tenant-registry';
import { bindMethods } from '../../utils';
import { ApiKeyService } from '../apiKey/apiKey.service';
import { CreateTenant } from './admin.types';
import crypto from 'crypto';

export class CmsTenantStoreAdminService {
    private readonly apiKeyService: ApiKeyService;
    constructor() {
        bindMethods(this);
        this.apiKeyService = new ApiKeyService();
    }

    async createTenant(input: CreateTenant) {
        const apiKey = this.apiKeyService.generateApiKey({ tenantId: input.tenantId });

        const result = await CmsTenantRegistry.createTenantConfig({
            apiKey,
            databaseUrl: input.databaseUrl,
            tenantId: input.tenantId,
            tenantName: input.tenantName,
            logger: input.logger,
        });

        return result;
    }

    async getAllTenants({ logger }: { logger: Logger }) {
        return await CmsTenantRegistry.getAllTenants({ logger });
    }
}

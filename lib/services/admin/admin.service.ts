import { CmsTenantRegistry } from '../../dynamodb/models/cms-tenant-registry';
import { bindMethods } from '../../utils';
import { CreateTenant } from './admin.types';
import crypto from 'crypto';

export class CmsTenantStoreAdminService {
    constructor() {
        bindMethods(this);
    }

    async createTenant(input: CreateTenant) {
        const apiKey = this.generateApiKey();

        const result = await CmsTenantRegistry.createTenantConfig({
            apiKey,
            databaseUrl: input.databaseUrl,
            tenantId: input.tenantId,
            tenantName: input.tenantName,
            logger: input.logger,
        });

        return result;
    }

    async getAllTenants() {
        // const tenants = await CmsTenantRegistry.ge;
    }

    private generateApiKey() {
        return crypto.randomBytes(16).toString('hex');
    }
}

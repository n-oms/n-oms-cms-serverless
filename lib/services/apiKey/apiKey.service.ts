import { bindMethods } from '../../utils';

export class ApiKeyService {
    constructor() {
        bindMethods(this);
    }

    generateApiKey({ tenantId }: { tenantId: string }) {
        return this.encodeTenantId({ tenantId });
    }

    encodeTenantId({ tenantId }: { tenantId: string }) {
        const strigifiedTenantInfo = JSON.stringify({ tenantId });
        return Buffer.from(strigifiedTenantInfo).toString('base64');
    }

    decodeApiKey({ apiKey }: { apiKey: string }) {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        return decoded ? (JSON.parse(decoded) as { tenantId: string }) : undefined;
    }
}

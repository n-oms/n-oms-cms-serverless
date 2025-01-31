import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { CmsTenantRegistry } from '../dynamodb/models/cms-tenant-registry';
import { ApiKeyService } from '../services/apiKey/apiKey.service';
import { bindMethods, lambdaResponse } from '../utils';

export class StoreAuthMiddleware {
    private readonly apiKeyService: ApiKeyService;
    private readonly logger: Logger;
    constructor() {
        this.apiKeyService = new ApiKeyService();
        this.logger = new Logger({ serviceName: this.constructor.name });
        bindMethods(this);
    }
    async handler({
        event,
        next,
    }: {
        event: APIGatewayProxyEvent;
        next: (event: APIGatewayProxyEvent) => Promise<any>;
    }) {
        this.logger.info('Decoding Api Key');

        const apiKey = event.headers['x-api-key'];

        this.logger.info('Api Key', { apiKey });

        if (!apiKey) {
            return lambdaResponse({ status: 401, data: { message: 'Unauthorized' } });
        }

        const decodedInfo = this.apiKeyService.decodeApiKey({ apiKey });

        if (!decodedInfo || !decodedInfo.tenantId) {
            return lambdaResponse({ status: 401, data: { message: 'Invalid Api Key' } });
        }

        const tenantInfo = await CmsTenantRegistry.getTenantConfig({
            tenantId: decodedInfo.tenantId,
            logger: this.logger,
        });

        if (!tenantInfo) {
            return lambdaResponse({ status: 401, data: { message: 'Tenant not found' } });
        }

        (event as any).tenantInfo = tenantInfo;

        return await next(event);
    }
}

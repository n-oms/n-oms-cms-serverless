import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { CmsTenantStoreAdminService } from '../../lib/services/admin/admin.service';
import { TenantStoreAdminActions } from '../../lib/types';
import {
    bindMethods,
    lambdaResponse,
    parseApiGatewayEvent,
    parseApiGatewayEventbody,
} from '../../lib/utils';
import { CreateTenantApiBodySchema, TenantStoreAdminApiBodySchema } from '../../lib/validations';
import { createLambdaHandler } from '../../lib/createLambdaHandler';

export class TenantStoreAdminHandler {
    private readonly cmsTenantStoreAdminService: CmsTenantStoreAdminService;
    private readonly logger: Logger;
    constructor() {
        this.logger = new Logger({ serviceName: this.constructor.name });
        this.cmsTenantStoreAdminService = new CmsTenantStoreAdminService();
        bindMethods(this);
    }
    async handler(event: APIGatewayProxyEvent) {
        const input = parseApiGatewayEvent({ event, schema: TenantStoreAdminApiBodySchema });

        switch (input.action) {
            case TenantStoreAdminActions.CREATE_TENANT: {
                const body = parseApiGatewayEventbody({
                    body: input,
                    schema: CreateTenantApiBodySchema,
                });

                const tenantConfig = await this.cmsTenantStoreAdminService.createTenant({
                    ...body.data,
                    logger: this.logger,
                });

                return lambdaResponse({ status: 200, data: tenantConfig });
            }
            case TenantStoreAdminActions.GET_ALL_TENANTS: {
                const tenants = await this.cmsTenantStoreAdminService.getAllTenants({
                    logger: this.logger,
                });
                return lambdaResponse({ status: 200, data: tenants });
            }
        }
    }
}

export const handler = createLambdaHandler({ handler: new TenantStoreAdminHandler().handler });

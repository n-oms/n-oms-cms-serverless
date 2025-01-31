import { Logger } from '@aws-lambda-powertools/logger';
import { createLambdaHandler } from '../../lib/createLambdaHandler';
import { StoreAuthMiddleware } from '../../lib/middlewares/storeAuth';
import { TenantStoreService } from '../../lib/services/tenantStore/tenantStore.service';
import { StoreApiEvent, TenantStoreApiActions } from '../../lib/types';
import { bindMethods, getEventAction, getEventInfo, lambdaResponse } from '../../lib/utils';
import { StoreApiSchemas } from './validations';

export class TenantStoreApiHandler {
    private readonly tenantStoreService: TenantStoreService;
    private readonly logger: Logger;
    constructor() {
        this.tenantStoreService = new TenantStoreService();
        this.logger = new Logger({ serviceName: this.constructor.name });
        bindMethods(this);
    }

    async handler(event: StoreApiEvent) {
        const { action, body } = getEventInfo({ event });

        let response;

        switch (action) {
            case TenantStoreApiActions.READ: {
                const data = StoreApiSchemas.ReadData.parse({
                    ...body,
                    tenantInfo: event.tenantInfo,
                });

                response = await this.tenantStoreService.readData({
                    logger: this.logger,
                    targetCollection: data.targetCollection,
                    tenantInfo: event.tenantInfo,
                    filter: data.filter,
                });
            }
        }
        return lambdaResponse({ status: 200, data: response });
    }
}

export const handler = createLambdaHandler({
    handler: new TenantStoreApiHandler().handler,
    middleware: new StoreAuthMiddleware().handler,
});

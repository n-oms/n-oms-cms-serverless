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
                break;
            }
            case TenantStoreApiActions.CREATE: {
                const input = StoreApiSchemas.CreateData.parse({
                    ...body,
                    tenantInfo: event.tenantInfo,
                });
                response = await this.tenantStoreService.createData({
                    logger: this.logger,
                    targetCollection: input.targetCollection,
                    data: input.data,
                    tenantInfo: event.tenantInfo,
                    addToBackOffice: input.addToBackOffice,
                });
                break;
            }
            case TenantStoreApiActions.UPDATE: {
                const input = StoreApiSchemas.UpdateData.parse({
                    ...body,
                    tenantInfo: event.tenantInfo,
                });

                response = await this.tenantStoreService.updateData({
                    logger: this.logger,
                    targetCollection: input.targetCollection,
                    data: input.data,
                    filter: input.filter,
                    tenantInfo: event.tenantInfo,
                });
                break;
            }
            case TenantStoreApiActions.DELETE: {
                const input = StoreApiSchemas.DeleteData.parse({
                    ...body,
                    tenantInfo: event.tenantInfo,
                });

                response = await this.tenantStoreService.deleteData({
                    logger: this.logger,
                    targetCollection: input.targetCollection,
                    filter: input.filter,
                    tenantInfo: event.tenantInfo,
                });
                break;
            }
        }
        return lambdaResponse({ status: 200, data: response });
    }
}

export const handler = createLambdaHandler({
    handler: new TenantStoreApiHandler().handler,
    middleware: new StoreAuthMiddleware().handler,
});

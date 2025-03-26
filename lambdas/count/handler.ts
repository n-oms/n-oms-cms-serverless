import { Logger } from '@aws-lambda-powertools/logger';
import { createLambdaHandler } from '../../lib/createLambdaHandler';
import { StoreAuthMiddleware } from '../../lib/middlewares/storeAuth';
import { CountService } from '../../lib/services/count/count.service';
import { StoreApiEvent } from '../../lib/types';
import { bindMethods, getEventInfo, lambdaResponse } from '../../lib/utils';
import { CountActions } from './types';
import { CountSchemas } from './validations';

export class CountApiHandler {
    private readonly countService: CountService;
    private readonly logger: Logger;
    constructor() {
        this.countService = new CountService();
        this.logger = new Logger({ serviceName: this.constructor.name });
        bindMethods(this);
    }

    async handler(event: StoreApiEvent) {
        const { action, body } = getEventInfo({ event });

        let response;

        switch (action) {
            case CountActions.GET_COUNT: {
                const data = CountSchemas.GetCount.parse({
                    ...body,
                    tenantInfo: event.tenantInfo,
                });

                response = await this.countService.getCount({
                    logger: this.logger,
                    targetCollection: data.targetCollection,
                    filter: data.filter,
                    tenantInfo: event.tenantInfo,
                });
                break;
            }
            default:
                throw new Error(`Unsupported action: ${action}`);
        }
        return lambdaResponse({ status: 200, data: response });
    }
}

export const handler = createLambdaHandler({
    handler: new CountApiHandler().handler,
    middleware: new StoreAuthMiddleware().handler,
});
import { Logger } from '@aws-lambda-powertools/logger';
import { createLambdaHandler } from '../../lib/createLambdaHandler';
import { StoreAuthMiddleware } from '../../lib/middlewares/storeAuth';
import { AggregationService } from '../../lib/services/aggregation/aggregation.service';
import { StoreApiEvent } from '../../lib/types';
import { bindMethods, getEventInfo, lambdaResponse } from '../../lib/utils';
import { AggregationActions } from './types';
import { AggregationSchemas } from './validations';

export class AggregationApiHandler {
    private readonly aggregationService: AggregationService;
    private readonly logger: Logger;
    constructor() {
        this.aggregationService = new AggregationService();
        this.logger = new Logger({ serviceName: this.constructor.name });
        bindMethods(this);
    }

    async handler(event: StoreApiEvent) {
        const { action, body } = getEventInfo({ event });

        let response;

        switch (action) {
            case AggregationActions.ACCUMULATE: {
                const data = AggregationSchemas.AccumulateData.parse({
                    ...body,
                    tenantInfo: event.tenantInfo,
                });

                response = await this.aggregationService.accumulateProperty({
                    logger: this.logger,
                    targetCollection: data.targetCollection,
                    property: data.property,
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
    handler: new AggregationApiHandler().handler,
    middleware: new StoreAuthMiddleware().handler,
});
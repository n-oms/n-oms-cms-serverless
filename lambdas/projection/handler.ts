import { Logger } from '@aws-lambda-powertools/logger';
import { createLambdaHandler } from '../../lib/createLambdaHandler';
import { StoreAuthMiddleware } from '../../lib/middlewares/storeAuth';
import { ProjectionService } from '../../lib/services/projection/projection.service';
import { StoreApiEvent } from '../../lib/types';
import { bindMethods, getEventInfo, lambdaResponse } from '../../lib/utils';
import { ProjectionActions } from './types';
import { ProjectionSchemas } from './validations';

export class ProjectionApiHandler {
    private readonly projectionService: ProjectionService;
    private readonly logger: Logger;
    constructor() {
        this.projectionService = new ProjectionService();
        this.logger = new Logger({ serviceName: this.constructor.name });
        bindMethods(this);
    }

    async handler(event: StoreApiEvent) {
        const { action, body } = getEventInfo({ event });

        let response;

        switch (action) {
            case ProjectionActions.GET_PROJECTION: {
                const data = ProjectionSchemas.GetProjection.parse({
                    ...body,
                    tenantInfo: event.tenantInfo,
                });

                response = await this.projectionService.getProjection({
                    logger: this.logger,
                    targetCollection: data.targetCollection,
                    properties: data.properties,
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
    handler: new ProjectionApiHandler().handler,
    middleware: new StoreAuthMiddleware().handler,
});
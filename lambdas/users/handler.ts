import { Logger } from '@aws-lambda-powertools/logger';
import { createLambdaHandler } from '../../lib/createLambdaHandler';
import { BadRequestException } from '../../lib/errors/badrequestException';
import { StoreAuthMiddleware } from '../../lib/middlewares/storeAuth';
import { UserService } from '../../lib/services/user/user.service';
import { AuthorizedApiEvent } from '../../lib/types';
import { bindMethods, getEventInfo, lambdaResponse } from '../../lib/utils';
import { UserActions } from './types';
import { UserHandlerSchemas } from './validations';

export class CmsAuthenticationLambdaHandler {
    private readonly logger: Logger;
    private readonly userService: UserService;

    constructor() {
        this.logger = new Logger({ serviceName: this.constructor.name });
        this.userService = new UserService();
        bindMethods(this);
    }

    async handler(event: AuthorizedApiEvent) {
        const { action, body } = getEventInfo({ event });

        if (!action) {
            throw new BadRequestException('Action is required');
        }

        let result;
        switch (action) {
            case UserActions.CREATE_USER: {
                const input = UserHandlerSchemas.CreateUser.parse(body);
                result = await this.userService.createUser({
                    data: input.data,
                    email: input.email,
                    tenantId: event.tenantInfo.tenantId,
                    logger: this.logger,
                });
                break;
            }

            case UserActions.GET_USER: {
                const input = UserHandlerSchemas.GetUser.parse(body);
                result = await this.userService.getUser({
                    tenantId: event.tenantInfo.tenantId,
                    email: input.email,
                    logger: this.logger,
                });
                break;
            }

            case UserActions.UPDATE_USER: {
                const input = UserHandlerSchemas.UpdateUser.parse(body);
                result = await this.userService.updateUser({
                    tenantId: event.tenantInfo.tenantId,
                    email: input.email,
                    data: input.data,
                    logger: this.logger,
                });
                break;
            }

            default:
                throw new BadRequestException('Invalid action');
        }

        return lambdaResponse({ status: 200, data: result });
    }
}

export const handler = createLambdaHandler({
    handler: new CmsAuthenticationLambdaHandler().handler,
    middleware: new StoreAuthMiddleware().handler,
});

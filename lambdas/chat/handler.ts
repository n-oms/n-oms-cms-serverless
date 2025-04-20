// lambdas/chat/handler.ts
import { Logger } from '@aws-lambda-powertools/logger';
import { createLambdaHandler } from '../../lib/createLambdaHandler';
import { StoreAuthMiddleware } from '../../lib/middlewares/storeAuth';
import { ChatService } from '../../lib/services/chat/chat.service';
import { StoreApiEvent } from '../../lib/types';
import { bindMethods, getEventInfo, lambdaResponse } from '../../lib/utils';
import { ChatActions } from './types';

export class ChatApiHandler {
    private readonly chatService: ChatService;
    private readonly logger: Logger;

    constructor() {
        this.chatService = new ChatService();
        this.logger = new Logger({ serviceName: this.constructor.name });
        bindMethods(this);
    }

    async handler(event: StoreApiEvent) {
        const { action, body } = getEventInfo({ event });

        let response;

        switch (action) {
            case ChatActions.CREATE_ROOM:
                response = await this.chatService.createChatRoom({
                    tenantId: event.tenantInfo.tenantId,
                    name: body.name,
                    description: body.description,
                    members: body.members,
                    logger: this.logger,
                });
                break;

            case ChatActions.GET_ROOMS:
                response = await this.chatService.getChatRooms({
                    tenantId: event.tenantInfo.tenantId,
                    userId: body.userId,
                    logger: this.logger,
                });
                break;

            case ChatActions.GET_HISTORY:
                response = await this.chatService.getChatHistory({
                    tenantId: event.tenantInfo.tenantId,
                    chatRoomId: body.chatRoomId,
                    limit: body.limit,
                    before: body.before,
                    logger: this.logger,
                });
                break;

            default:
                throw new Error(`Unsupported action: ${action}`);
        }

        return lambdaResponse({ status: 200, data: response });
    }
}

export const handler = createLambdaHandler({
    handler: new ChatApiHandler().handler,
    middleware: new StoreAuthMiddleware().handler,
});
// lambdas/websocket/handler.ts
import { Logger } from '@aws-lambda-powertools/logger';
import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { bindMethods } from '../../lib/utils';
import { env } from '../../lib/env';

export class WebSocketHandler {
    private readonly logger: Logger;
    private readonly dynamoClient: DynamoDBDocumentClient;

    constructor() {
        this.logger = new Logger({ serviceName: this.constructor.name });
        const ddbClient = new DynamoDBClient({ region: env.REGION });
        this.dynamoClient = DynamoDBDocumentClient.from(ddbClient);
        bindMethods(this);
    }

    async handler(event) {
        const { routeKey } = event;

        this.logger.info('WebSocket event received', { routeKey });

        switch (routeKey) {
            case '$connect':
                return this.handleConnect(event);
            case '$disconnect':
                return this.handleDisconnect(event);
            case 'message':
                return this.handleMessage(event);
            default:
                return { statusCode: 400, body: 'Unsupported route' };
        }
    }

    async handleConnect(event) {
        const connectionId = event.requestContext.connectionId;
        const tenantId = event.queryStringParameters?.tenantId;

        if (!tenantId) {
            return { statusCode: 401, body: 'Tenant ID is required' };
        }

        try {
            await this.dynamoClient.send(new PutCommand({
                TableName: env.WEBSOCKET_CONNECTIONS_TABLE,
                Item: {
                    connectionId,
                    tenantId,
                    userId: event.queryStringParameters?.userId || 'anonymous',
                    connectedAt: new Date().toISOString(),
                },
            }));

            return { statusCode: 200, body: 'Connected' };
        } catch (error) {
            this.logger.error('Error handling connection', { error });
            return { statusCode: 500, body: 'Failed to connect' };
        }
    }

    async handleDisconnect(event) {
        const connectionId = event.requestContext.connectionId;

        try {
            await this.dynamoClient.send(new DeleteCommand({
                TableName: env.WEBSOCKET_CONNECTIONS_TABLE,
                Key: { connectionId },
            }));

            return { statusCode: 200, body: 'Disconnected' };
        } catch (error) {
            this.logger.error('Error handling disconnection', { error });
            return { statusCode: 500, body: 'Failed to disconnect' };
        }
    }

    async handleMessage(event) {
        const connectionId = event.requestContext.connectionId;
        const body = JSON.parse(event.body);
        const { message, chatRoomId } = body;

        if (!message || !chatRoomId) {
            return { statusCode: 400, body: 'Message and chatRoomId are required' };
        }

        try {
            // 1. Get connection info for the sender
            const connectionInfo = await this.dynamoClient.send(new QueryCommand({
                TableName: env.WEBSOCKET_CONNECTIONS_TABLE,
                KeyConditionExpression: 'connectionId = :connectionId',
                ExpressionAttributeValues: {
                    ':connectionId': connectionId,
                },
            }));

            const sender = connectionInfo.Items?.[0];
            if (!sender) {
                return { statusCode: 400, body: 'Sender not found' };
            }

            const tenantId = sender.tenantId;

            // 2. Get all connections for this tenant
            const connections = await this.dynamoClient.send(new QueryCommand({
                TableName: env.WEBSOCKET_CONNECTIONS_TABLE,
                IndexName: 'tenantId-index',
                KeyConditionExpression: 'tenantId = :tenantId',
                ExpressionAttributeValues: {
                    ':tenantId': tenantId,
                },
            }));

            // 3. Store the message
            const timestamp = new Date().toISOString();
            await this.storeMessage({
                tenantId,
                chatRoomId,
                userId: sender.userId,
                message,
                timestamp,
            });

            // 4. Broadcast to all connections of this tenant
            const apiGateway = new ApiGatewayManagementApi({
                endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
            });

            const messageData = JSON.stringify({
                chatRoomId,
                userId: sender.userId,
                message,
                timestamp,
            });

            const sendPromises = connections.Items?.map(async (connection) => {
                try {
                    await apiGateway.postToConnection({
                        ConnectionId: connection.connectionId,
                        Data: messageData,
                    });
                } catch (error) {
                    if (error.statusCode === 410) {
                        // Connection is stale, remove it
                        await this.dynamoClient.send(new DeleteCommand({
                            TableName: env.WEBSOCKET_CONNECTIONS_TABLE,
                            Key: { connectionId: connection.connectionId },
                        }));
                    }
                }
            });

            if (sendPromises) {
                await Promise.all(sendPromises);
            }

            return { statusCode: 200, body: 'Message sent' };
        } catch (error) {
            this.logger.error('Error handling message', { error });
            return { statusCode: 500, body: 'Failed to send message' };
        }
    }

    async storeMessage({ tenantId, chatRoomId, userId, message, timestamp }) {
        // Store message in your preferred database
        // This could be DynamoDB, MongoDB, etc.
        // For now, just log it
        this.logger.info('Storing message', {
            tenantId,
            chatRoomId,
            userId,
            message,
            timestamp,
        });

        // If you want to store in DynamoDB:
        await this.dynamoClient.send(new PutCommand({
            TableName: env.DYNAMODB_TABLE_NAME,
            Item: {
                PK: `TENANT#${tenantId}#CHAT#${chatRoomId}`,
                SK: `MESSAGE#${timestamp}`,
                userId,
                message,
                createdAt: timestamp,
            },
        }));
    }
}

export const handler = new WebSocketHandler().handler;
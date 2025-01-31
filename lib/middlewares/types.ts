import { APIGatewayProxyEvent } from 'aws-lambda';

export type MiddlewareFn = (prop: {
    event: APIGatewayProxyEvent;
    next: (event: APIGatewayProxyEvent) => any;
}) => any;

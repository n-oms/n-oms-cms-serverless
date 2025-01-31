import { ZodError } from 'zod';
import { lambdaResponse } from './utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { MiddlewareFn } from './middlewares/types';

export const createLambdaHandler = ({
    handler,
    middleware,
}: {
    handler: (event: any) => unknown;
    middleware?: MiddlewareFn;
}) => {
    return async function (event: APIGatewayProxyEvent) {
        try {
            if (middleware) {
                return await middleware({ event, next: handler });
            }

            return await handler(event);
        } catch (error) {
            if (error instanceof ZodError) {
                return lambdaResponse({
                    status: 400,
                    data: { message: 'Validation Error', error: error.errors },
                });
            }
            return lambdaResponse({
                status: 500,
                data: { message: 'Unknow error happened', error },
            });
        }
    };
};

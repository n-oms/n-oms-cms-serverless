import { ZodError } from 'zod';
import { lambdaResponse } from './utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { MiddlewareFn } from './middlewares/types';
import { HttpError } from './errors/httpError';

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
            return handleError(error);
        }
    };
};

const handleError = (error: unknown) => {
    if (error instanceof ZodError) {
        return lambdaResponse({
            status: 400,
            data: { message: 'Validation Error', error: error.errors },
        });
    }

    if (error instanceof HttpError) {
        return lambdaResponse({
            status: error.status,
            data: { name: error.name, message: error.message },
        });
    }

    return lambdaResponse({
        status: 500,
        data: { message: 'Internal Server Error', error: error },
    });
};

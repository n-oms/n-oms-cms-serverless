import { ZodError } from 'zod';
import { lambdaResponse } from './utils';

export const createLambdaHandler = ({ handler }: { handler: (event: any) => unknown }) => {
    return async function (event: unknown) {
        try {
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

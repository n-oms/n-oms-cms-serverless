import { DEPLOYMENT_ENVS } from '../../lib/env';
import { FunctionDefinition } from '../../lib/types';

export const config: FunctionDefinition = {
    handler: 'lambdas/store/handler.handler',
    events: [
        {
            http: {
                path: '/store',
                method: 'post',
                cors: true,
            },
        },
    ],
    environment: {
        DYNAMODB_TABLE_NAME: DEPLOYMENT_ENVS.DYNAMODB_TABLE_NAME,
    },
};

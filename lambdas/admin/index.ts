import { DEPLOYMENT_ENVS } from '../../lib/env';
import { FunctionDefinition } from '../../lib/types';

export const config: FunctionDefinition = {
    handler: 'lambdas/admin/handler.handler',
    events: [
        {
            http: {
                path: '/admin',
                method: 'post',
                cors: true,
            },
        },
    ],
    environment: {
        DYNAMODB_TABLE_NAME: DEPLOYMENT_ENVS.DYNAMODB_TABLE_NAME,
        REGION: DEPLOYMENT_ENVS.REGION,
    },
};

import { DEPLOYMENT_ENVS } from '../../lib/env';
import { FunctionDefinition } from '../../lib/types';

export const config: FunctionDefinition = {
    handler: 'lambdas/aggregation/handler.handler',
    events: [
        {
            http: {
                path: '/aggregation',
                method: 'post',
                cors: true,
            },
        },
    ],
    environment: {
        DYNAMODB_TABLE_NAME: DEPLOYMENT_ENVS.DYNAMODB_TABLE_NAME,
        MULTI_TENANT_DB_URL: DEPLOYMENT_ENVS.MULTI_TENANT_DB_URL,
        REGION: DEPLOYMENT_ENVS.REGION,
    },
    timeout: 60,
};
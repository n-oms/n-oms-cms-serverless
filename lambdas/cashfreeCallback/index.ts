import { DEPLOYMENT_ENVS } from '../../lib/env';
import { FunctionDefinition } from '../../lib/types';

export const config: FunctionDefinition = {
    handler: 'lambdas/cashFreeCallback/handler.handler',
    events: [
        {
            httpApi: {
                method: 'post',
                path: '/cashfree-callback',
            },
        },
    ],
    environment: {
        MULTI_TENANT_DB_URL: DEPLOYMENT_ENVS.MULTI_TENANT_DB_URL,
    },
};

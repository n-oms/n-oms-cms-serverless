import { FunctionDefinition } from '../../lib/types';

export const config: FunctionDefinition = {
    handler: 'lambdas/store/handler.handler',
    events: [
        {
            http: {
                path: '/store',
                method: 'post',
            },
        },
    ],
};

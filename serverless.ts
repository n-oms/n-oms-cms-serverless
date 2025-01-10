import { AWS } from '@serverless/typescript';
import { env } from './lib/env';
import { createLambdaFunctionList } from './lib/createLambdaFunctionList';
import * as lambdas from './lambdas';
import { resources } from './resources';

export const serverlessConfiguration: AWS = {
    service: 'n-oms-cms-serverless',
    useDotenv: true,
    provider: {
        name: 'aws',
        runtime: 'nodejs18.x',
        region: env.REGION as AWS['provider']['region'],
        stage: env.STAGE,
    },
    package: {
        individually: true,
        excludeDevDependencies: true,
    },
    functions: createLambdaFunctionList({ lambdas }),
    resources: {
        Resources: resources as NonNullable<AWS['resources']>['Resources'],
    },
};

export default serverlessConfiguration;

import { AWS } from '@serverless/typescript';
import { DEPLOYMENT_ENVS, env } from './lib/env';
import { createLambdaFunctionList } from './lib/createLambdaFunctionList';
import * as lambdas from './lambdas';
import { resources } from './resources';
import { createDynamoArn } from './lib/utils';

export const serverlessConfiguration: AWS = {
    service: 'n-oms-cms-serverless',
    useDotenv: true,
    provider: {
        name: 'aws',
        runtime: 'nodejs18.x',
        region: DEPLOYMENT_ENVS.REGION as AWS['provider']['region'],
        stage: process.env.STAGE || 'dev',
        iamRoleStatements: [
            {
                Effect: 'Allow',
                Action: [
                    'dynamodb:GetItem',
                    'dynamodb:PutItem',
                    'dynamodb:UpdateItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:Query',
                    'dynamodb:Scan',
                ],
                Resource: [createDynamoArn({ tableName: DEPLOYMENT_ENVS.DYNAMODB_TABLE_NAME })],
            },
        ],
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

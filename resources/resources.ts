import { DEPLOYMENT_ENVS, env } from '../lib/env';
import { CloudFormationResourceTypes, ResourceDefinition } from '../lib/types';
import { createResourceName } from '../lib/utils';

export const multiTenantNomsCmsDeadLetterQueue: ResourceDefinition = {
    Type: CloudFormationResourceTypes.SQS_QUEUE,
    Properties: {
        QueueName: createResourceName('dead-letter-queue'),
    },
};

export const multiTenantNomsCmsSqsQueue: ResourceDefinition = {
    Type: CloudFormationResourceTypes.SQS_QUEUE,
    Properties: {
        QueueName: createResourceName('queue'),
        VisibilityTimeout: 70,
        RedrivePolicy: {
            deadLetterTargetArn: {
                'Fn::GetAtt': ['multiTenantNomsCmsDeadLetterQueue', 'Arn'],
            },
            maxReceiveCount: 5,
        },
    },
};

export const cmsTenantRegistryTable: ResourceDefinition = {
    Type: CloudFormationResourceTypes.DYNAMO_TABLE,
    Properties: {
        TableName: DEPLOYMENT_ENVS.DYNAMODB_TABLE_NAME,
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
        ],
        KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    },
};

export const multiTenantNomsCmsUserPool: ResourceDefinition = {
    Type: CloudFormationResourceTypes.COGNITO_USER_POOL,
    Properties: {
        UserPoolName: createResourceName('users'),
        AdminCreateUserConfig: {
            AllowAdminCreateUserOnly: false,
        },
        AutoVerifiedAttributes: ['email'],
        UsernameAttributes: ['email'],
        Schema: [
            {
                Name: 'email',
                AttributeDataType: 'String',
                Required: true,
                Mutable: true,
            },
        ],
        Policies: {
            PasswordPolicy: {
                MinimumLength: 8,
                RequireLowercase: true,
                RequireNumbers: true,
                RequireSymbols: true,
                RequireUppercase: true,
            },
        },
    },
};

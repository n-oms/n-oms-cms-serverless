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

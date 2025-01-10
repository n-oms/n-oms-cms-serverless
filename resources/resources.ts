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

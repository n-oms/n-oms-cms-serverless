import { AWS } from '@serverless/typescript';

export type FunctionDefinition = NonNullable<AWS['functions']>[string];

export enum CloudFormationResourceTypes {
    SQS_QUEUE = 'AWS::SQS::Queue',
    DYNAMO_TABLE = 'AWS::DynamoDB::Table',
    LAMBDA_FUNCTION = 'AWS::Lambda::Function',
    S3_BUCKET = 'AWS::S3::Bucket',
    SNS_TOPIC = 'AWS::SNS::Topic',
    API_GATEWAY_REST_API = 'AWS::ApiGateway::RestApi',
    CLOUDWATCH_LOG_GROUP = 'AWS::Logs::LogGroup',
    IAM_ROLE = 'AWS::IAM::Role',
    IAM_POLICY = 'AWS::IAM::Policy',
}

export type ResourceDefinition = {
    Type: string;
    Properties?: { [k: string]: unknown };
    CreationPolicy?: { [k: string]: unknown };
    DeletionPolicy?: string;
    DependsOn?: string | string[];
    Metadata?: { [k: string]: unknown };
    UpdatePolicy?: { [k: string]: unknown };
    UpdateReplacePolicy?: string;
    Condition?: string;
};

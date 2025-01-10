import { Logger } from '@aws-lambda-powertools/logger';
import { env } from './env';
import { SQSRecord } from 'aws-lambda';
import { record, ZodSchema } from 'zod';

export const createResourceName = (name: string) => {
    return `multi-tenant-cms-${name}-${env.STAGE}`;
};

export const createSqsArn = ({ queueName }: { queueName: string }) => {
    return `arn:aws:sqs:${env.REGION}:${env.ACCOUNT_ID}:${queueName}`;
};

export interface ILambdaService {
    logger: Logger;
    handler: (event: any) => Promise<any>;
}

export const getSqsRecordBody = <T>({ record }: { record: SQSRecord }) => {
    if (!record.body) {
        return null;
    }
    return (typeof record.body === 'string' ? JSON.parse(record.body) : record.body) as T;
};

export const parseSqsrecordBody = <T>({
    record,
    schema,
}: {
    record: SQSRecord;
    schema: ZodSchema<unknown>;
}) => {
    const body = getSqsRecordBody<T>({ record });
    return schema.parse(body) as T;
};

export function bindMethods<T>(instance: T): T {
    const prototype = Object.getPrototypeOf(instance);
    Object.getOwnPropertyNames(prototype).forEach((name) => {
        if (name !== 'constructor' && typeof instance[name] === 'function') {
            instance[name] = instance[name].bind(instance);
        }
    });
    return instance;
}

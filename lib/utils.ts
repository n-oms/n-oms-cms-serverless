import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent, SQSRecord } from 'aws-lambda';
import { ZodSchema } from 'zod';
import { DEPLOYMENT_ENVS, env } from './env';
import { NotFoundException } from './errors/not-found';

export const createResourceName = (name: string) => {
    return `multi-tenant-cms-${name}`;
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

export const queryStringToJson = (queryString: string): Record<string, string> => {
    return queryString
        .split('&') // Split the query string into key-value pairs
        .reduce(
            (acc, pair) => {
                const [key, value] = pair.split('=').map(decodeURIComponent); // Decode and split key and value
                acc[key] = value; // Add the key-value pair to the result object
                return acc;
            },
            {} as Record<string, string>,
        );
};

export const lambdaResponse = ({ status, data }: { status: number; data: unknown }) => {
    return {
        statusCode: status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify(data),
    };
};

export const convertApiGatewayEventToData = <T>({ event }: { event: APIGatewayProxyEvent }): T => {
    return typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
};

export const getEventAction = <T>({ event }: { event: APIGatewayProxyEvent }): T => {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;

    if (!body.action) {
        throw new NotFoundException('Action not found in event body');
    }

    return body.action;
};

export const getEventInfo = ({ event }: { event: APIGatewayProxyEvent }) => {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
    return { action: body.action, body };
};

export const parseApiGatewayEvent = <T>({
    event,
    schema,
}: {
    event: APIGatewayProxyEvent;
    schema: ZodSchema<T>;
}): T => {
    const body = convertApiGatewayEventToData<T>({ event });
    return schema.parse(body);
};

export const parseApiGatewayEventbody = <T>({
    body,
    schema,
}: {
    body: unknown;
    schema: ZodSchema<T>;
}): T => {
    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    return schema.parse(parsedBody);
};

export const createDynamoArn = ({ tableName }: { tableName: string }) => {
    return `arn:aws:dynamodb:${DEPLOYMENT_ENVS.REGION}:${DEPLOYMENT_ENVS.ACCOUNT_ID}:table/${tableName}`;
};

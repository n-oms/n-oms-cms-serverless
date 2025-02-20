import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    QueryCommandInput,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';
import { env } from '../env';
import { GetItem, PutItem } from './types';

export const dynamoDbClient = new DynamoDBClient({ region: env.REGION });

export const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
        convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
        wrapNumbers: true,
    },
});

export const getDdbItem = async <T>({ pk, sk, tableName, logger }: GetItem) => {
    logger.info('Retrieving item from DynamoDB', { pk, sk });

    const command = new GetCommand({
        TableName: tableName || env.DYNAMODB_TABLE_NAME,
        Key: {
            PK: pk,
            SK: sk,
        },
    });

    const result = await dynamoDbDocumentClient.send(command);

    if (!result) {
        return undefined;
    }

    logger.info('Item retrieved from DynamoDB', { item: result.Item });

    return result.Item as T;
};

export const putDdbItem = async ({ item, tableName, logger, options }: PutItem) => {
    logger.info('Putting item in DynamoDB', { item });

    if (options?.uniqueId && options?.uniqueId.field && !item[options.uniqueId.field]) {
        item[options.uniqueId.field] = createUniqueId();
    }

    const command = new PutCommand({
        TableName: tableName || env.DYNAMODB_TABLE_NAME,
        Item: item,
    });

    const response = await dynamoDbDocumentClient.send(command);

    logger.info('Item put in DynamoDB', { response });

    return response;
};

export const queryDdbItems = async <T>({
    query,
    logger,
}: {
    query: Omit<QueryCommandInput, 'TableName'>;
    logger: Logger;
}) => {
    logger.info('Querying items from DynamoDB', { query });

    const command = new QueryCommand({
        TableName: env.DYNAMODB_TABLE_NAME,
        ...query,
    });

    const result = await dynamoDbDocumentClient.send(command);

    if (!result) {
        return undefined;
    }

    logger.info('Items retrieved from DynamoDB', { items: result.Items });

    return result.Items as T[];
};

export const updateItem = async ({
    pk,
    sk,
    attributesToUpdate,
    logger,
}: {
    pk: string;
    sk: string | null;
    attributesToUpdate: Record<string, unknown>;
    logger: Logger;
}) => {
    logger.info('Updating item in DynamoDB', { pk, sk, attributesToUpdate });

    const { updateExpression, expressionAttributeNames, expressionAttributeValues } =
        constructUpdateExpression(attributesToUpdate);

    const command = new UpdateCommand({
        Key: {
            PK: pk,
            SK: sk,
        },
        TableName: env.DYNAMODB_TABLE_NAME,
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
    });

    return await dynamoDbDocumentClient.send(command);
};

export const constructUpdateExpression = (attributesToUpdate: Record<string, unknown>) => {
    const updateExpression = Object.keys(attributesToUpdate)
        .map((_, index) => `#field${index} = :value${index}`)
        .join(', ');

    const expressionAttributeNames = Object.keys(attributesToUpdate).reduce(
        (acc, key, index) => ({
            ...acc,
            [`#field${index}`]: key,
        }),
        {},
    );

    const expressionAttributeValues = Object.entries(attributesToUpdate).reduce(
        (acc, [_, value], index) => ({
            ...acc,
            [`:value${index}`]: value,
        }),
        {},
    );

    return {
        updateExpression,
        expressionAttributeNames,
        expressionAttributeValues,
    };
};

const createUniqueId = () => {
    return crypto.randomUUID();
};

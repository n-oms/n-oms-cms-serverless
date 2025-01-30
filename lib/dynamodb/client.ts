import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DEPLOYMENT_ENVS, env } from '../env';
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb';
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

export const putDdbItem = async <T>({ item, tableName, logger }: PutItem) => {
    logger.info('Putting item in DynamoDB', { item });

    const command = new PutCommand({
        TableName: tableName || env.DYNAMODB_TABLE_NAME,
        Item: item,
    });

    const response = await dynamoDbDocumentClient.send(command);

    logger.info('Item put in DynamoDB', { response });

    return response;
};

export const getDdbItems = () => {
    const command = new QueryCommand({
        TableName: env.DYNAMODB_TABLE_NAME,
    });
};

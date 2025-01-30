import { Logger } from '@aws-lambda-powertools/logger';

export type GetItem = {
    tableName?: string;
    pk: string;
    sk: string;
    logger: Logger;
};

export type PutItem = {
    tableName?: string;
    item: Record<string, any>;
    logger: Logger;
};

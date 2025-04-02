import { Logger } from '@aws-lambda-powertools/logger';

export type CreateUser = {
    email: string;
    data: any;
    tenantId: string;
    logger: Logger;
};

export type GetUser = {
    email: string;
    tenantId: string;
    logger: Logger;
};

export type UpdateUser = {
    email: string;
    tenantId: string;
    logger: Logger;
    data: any;
};

export type GetAllUsers = {
    tenantId: string;
    logger: Logger;
};
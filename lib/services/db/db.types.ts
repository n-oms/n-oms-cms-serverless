import { Logger } from '@aws-lambda-powertools/logger';
import mongoose from 'mongoose';

export type CreateDbItemInput = {
    model: mongoose.Model<any>;
    data: unknown;
    logger: Logger;
    connection?: mongoose.Connection;
    options: {
        closeConnection?: boolean;
    };
};

export type UpdateDbItemInput = {
    model: mongoose.Model<any>;
    data: Record<string, unknown>;
    filter: Record<string, unknown>;
    logger: Logger;
    connection?: mongoose.Connection;
    options: {
        closeConnection?: boolean;
    };
};

export type ReadItemUsingConnection = {
    model: mongoose.Model<any>;
    filter: Record<string, any>;
    logger: Logger;
    connection: mongoose.Connection;
    closeConnection?: boolean;
};

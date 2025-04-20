import { Logger } from '@aws-lambda-powertools/logger';
import { getDdbItem, putDdbItem, updateItem } from '../client';
import { User } from '../../types';
import { sanitizeEntity } from '../utils';

export class UserModel {
    static getPk({ tenantId }: { tenantId: string }) {
        return `TENANT#${tenantId}`;
    }

    static getSk({ email }: { email: string }) {
        return `USER#${email}`;
    }

    static async createUser({
        tenantId,
        email,
        data,
        logger,
    }: {
        tenantId: string;
        email: string;
        data: any;
        logger: Logger;
    }) {
        const userInfo: User = {
            ...data,
            email,
            tenantId,
            PK: this.getPk({ tenantId }),
            SK: this.getSk({ email }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const response = await putDdbItem({
            item: userInfo,
            logger,
            options: {
                uniqueId: {
                    field: 'userId',
                },
            },
        });

        if (response.$metadata.httpStatusCode !== 200) {
            logger.error('Error creating user', { response });
            return undefined;
        }

        return sanitizeEntity(userInfo);
    }

    static async getUser({
        email,
        logger,
        tenantId,
    }: {
        email: string;
        tenantId: string;
        logger: Logger;
    }) {
        const user = await getDdbItem<User>({
            pk: this.getPk({ tenantId }),
            sk: this.getSk({ email }),
            logger,
        });

        if (!user) {
            logger.error('User not found');
            return undefined;
        }

        return sanitizeEntity(user);
    }

    static async updateUser({
        tenantId,
        data,
        email,
        logger,
    }: {
        tenantId: string;
        email: string;
        data: any;
        logger: Logger;
    }) {
        const response = await updateItem({
            pk: this.getPk({ tenantId }),
            sk: this.getSk({ email }),
            logger,
            attributesToUpdate: {
                ...data,
                updatedAt: new Date().toISOString(),
            },
        });

        if (response.$metadata.httpStatusCode !== 200) {
            logger.error('Error updating user', { response });
            return undefined;
        }

        return response.Attributes;
    }
}

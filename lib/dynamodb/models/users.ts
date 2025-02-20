import { Logger } from '@aws-lambda-powertools/logger';
import { getDdbItem, putDdbItem, updateItem } from '../client';

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
        const userInfo = {
            ...data,
            email,
            tenantId,
            PK: this.getPk({ tenantId }),
            SK: this.getSk({ email }),
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

        return response;
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
        const response = await getDdbItem({
            pk: this.getPk({ tenantId }),
            sk: this.getSk({ email }),
            logger,
        });
        return response;
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
            attributesToUpdate: data,
        });
        return response;
    }
}

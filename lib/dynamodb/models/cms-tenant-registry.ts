import { Logger } from '@aws-lambda-powertools/logger';
import { getDdbItem, putDdbItem, queryDdbItems } from '../client';
import { NotFoundException } from '../../errors/not-found';
import { TenantConfig } from '../../types';

export class CmsTenantRegistry {
    static getPk() {
        return `CMS#TENANTS`;
    }

    static getSk({ tenantId }: { tenantId: string }) {
        return `TENANT#${tenantId}`;
    }

    static async getTenantConfig({ tenantId, logger }: { tenantId: string; logger: Logger }) {
        const tenantConfig = await getDdbItem<TenantConfig>({
            pk: this.getPk(),
            sk: this.getSk({ tenantId }),
            logger,
        });
        if (!tenantConfig) {
            throw new NotFoundException('Tenant not found');
        }
        return tenantConfig;
    }

    static async createTenantConfig({
        tenantId,
        apiKey,
        logger,
        databaseUrl,
        tenantName,
    }: {
        tenantId: string;
        apiKey: string;
        logger: Logger;
        databaseUrl: string;
        tenantName: string;
    }) {
        const tenantConfig = {
            PK: this.getPk(),
            SK: this.getSk({ tenantId }),
            tenantId: tenantId,
            apiKey,
            databaseUrl,
            tenantName,
        };

        logger.info('Creating tenant config', { tenantConfig });

        const result = await putDdbItem({ item: tenantConfig, logger });

        return result;
    }

    static async getAllTenants({ logger }: { logger: Logger }) {
        const tenants = await queryDdbItems<TenantConfig>({
            logger,
            query: {
                KeyConditionExpression: '#PK = :pk',
                ExpressionAttributeNames: {
                    '#PK': 'PK',
                },
                ExpressionAttributeValues: {
                    ':pk': this.getPk(),
                },
            },
        });
        return tenants;
    }
}

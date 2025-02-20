import { Logger } from '@aws-lambda-powertools/logger';
import { DB_URLS } from '../../constants';
import { CmsTenantRegistry } from '../../dynamodb/models/cms-tenant-registry';
import { Tenant, tenantSchema } from '../../schemas/tenant';
import { bindMethods } from '../../utils';
import { ModelService } from '../model.service';
import { CreateDbItemInput, ReadItemUsingConnection, UpdateDbItemInput } from './db.types';

export class DbService {
    private readonly modelService: ModelService;

    constructor() {
        this.modelService = new ModelService();
        bindMethods(this);
    }

    /**
     * Retrieves the database URL for a specific tenant from the multi-tenant database.
     *
     * @deprecated This method is deprecated and will be removed in future versions.
     * Use getUpdatedTenantDBUrl instead.
     *
     * @param {Object} params - The parameters object
     * @param {string} params.tenantId - The unique identifier of the tenant
     * @returns {Promise<string>} A promise that resolves to the tenant's database URL
     * @throws {Error} When tenant database URL is not found
     * @throws {Error} When database connection fails
     *
     * @example
     * const dbUrl = await dbService.getTenantDBUrl({ tenantId: 'tenant123' });
     */
    async getTenantDBUrl({ tenantId }: { tenantId: string }) {
        try {
            const { Model: TenantModel, connection } =
                this.modelService.createModelFromConnection<Tenant>({
                    url: DB_URLS.MULTI_TENANT_DB_URL,
                    modelName: 'tenants',
                    schema: tenantSchema,
                });

            const tenant = await TenantModel.findOne({ tenantId }).exec();

            const tenantDbUrl = tenant?.tenantDatabaseUrl;

            if (!tenantDbUrl) {
                throw new Error('Tenant database URL not found');
            }

            await connection.close();

            return tenantDbUrl;
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }

    async getTenantDatabaseUrl({
        tenantId,
        logger,
    }: {
        tenantId: string;
        logger: Logger;
    }): Promise<string> {
        const tenantInfo = await CmsTenantRegistry.getTenantConfig({ tenantId, logger });
        return tenantInfo.databaseUrl as string;
    }

    async createItemUsingConnection({
        data,
        model,
        options,
        connection,
        logger,
    }: CreateDbItemInput) {
        try {
            const result = await model.create(data);
            if (options.closeConnection && connection) {
                await connection.close();
            }
            return result;
        } catch (error) {
            logger.error({ message: 'Error creating item', error });
        }
    }

    async updateItemUsingConnection({
        data,
        model,
        options,
        connection,
        logger,
        filter,
    }: UpdateDbItemInput) {
        try {
            const result = await model.updateOne(filter, data, { new: true });
            if (options.closeConnection && connection) {
                await connection.close();
            }
            return result;
        } catch (error) {
            logger.error({ message: 'Error creating item', error });
        }
    }

    async readItemUsingConnection(input: ReadItemUsingConnection) {
        try {
            const filter = input.filter || {};
            const result = await input.model.find(filter).exec();
            if (input.closeConnection && input.connection) {
                await input.connection.close();
            }
            return result;
        } catch (error) {
            input.logger.error({ message: 'Error reading item', error });
        }
    }
}

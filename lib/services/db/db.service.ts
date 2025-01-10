import { DB_URLS } from '../../constants';
import { Tenant, tenantSchema } from '../../schemas/tenant';
import { bindMethods } from '../../utils';
import { ModelService } from '../model.service';
import { CreateDbItemInput, UpdateDbItemInput } from './db.types';

export class DbService {
    private readonly modelService: ModelService;

    constructor() {
        this.modelService = new ModelService();
        bindMethods(this);
    }

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
            const result = await model.updateOne(filter, data);
            if (options.closeConnection && connection) {
                await connection.close();
            }
            return result;
        } catch (error) {
            logger.error({ message: 'Error creating item', error });
        }
    }
}

import { bindMethods } from '../../utils';
import { zodSchemas } from '../../validations';
import { DbService } from '../db/db.service';
import { ModelService } from '../model.service';
import {
    CreateInTargetDbInput,
    ReadItemFromTargetDB,
    UpdateItemInTargetDbInput,
} from './cmsCrud.types';

export class CmsCrudService {
    private readonly dbService: DbService;
    private readonly modelService: ModelService;

    constructor() {
        this.dbService = new DbService();
        this.modelService = new ModelService();
        bindMethods(this);
    }

    async createItemInTargetDb(input: CreateInTargetDbInput) {
        const tenantDbUrl = await this.dbService.getTenantDBUrl({
            tenantId: input.tenantId,
        });

        input.logger.info('Tenant DB URL', { tenantDbUrl });

        if (!tenantDbUrl) {
            throw new Error('Tenant DB URL not found');
        }

        let data = input.data;

        if (input.isDataValidationRequired) {
            const zodSchema = zodSchemas[input.targetCollection];
            if (!zodSchema) {
                throw new Error('Invalid collection name or schema not provided');
            }
            data = zodSchema.parse(data);
        }

        const { Model: TargetCollectionModel, connection } =
            this.modelService.createModelFromConnection({
                url: tenantDbUrl,
                modelName: input.targetCollection,
            });

        input.logger.info('Model created', { TargetCollectionModel });

        const result = await this.dbService.createItemUsingConnection({
            data,
            model: TargetCollectionModel,
            options: { closeConnection: true },
            connection,
            logger: input.logger,
        });

        input.logger.info('Item created in target db', { result });

        return result;
    }

    async updateItemInTargetDb(input: UpdateItemInTargetDbInput) {
        console.log('Input', JSON.stringify(input));
        const tenantDbUrl = await this.dbService.getTenantDBUrl({
            tenantId: input.tenantId,
        });

        let data = input.data;

        if (input.isDataValidationRequired) {
            const zodSchema = zodSchemas[input.targetCollection];
            if (!zodSchema) {
                throw new Error('Invalid collection name or schema not provided');
            }
            data = zodSchema.parse(data);
        }

        const { Model: TargetCollectionModel, connection } =
            this.modelService.createModelFromConnection({
                url: tenantDbUrl,
                modelName: input.targetCollection,
            });

        const result = await this.dbService.updateItemUsingConnection({
            data,
            model: TargetCollectionModel,
            options: { closeConnection: true },
            connection,
            logger: input.logger,
            filter: input.filter,
        });

        input.logger.info('Item created in target db', { result });

        return result;
    }

    async readItemFromTargetDB(input: ReadItemFromTargetDB) {
        const tenantDbUrl =
            input.tenantDatabaseUrl ||
            (await this.dbService.getTenantDBUrl({
                tenantId: input.tenantId,
            }));

        const { Model, connection } = this.modelService.createModelFromConnection({
            modelName: input.targetCollection,
            url: tenantDbUrl,
        });

        const result = await this.dbService.readItemUsingConnection({
            model: Model,
            connection,
            filter: input.filter,
            logger: input.logger,
        });

        return result;
    }
}

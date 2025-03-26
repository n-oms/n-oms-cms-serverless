import { UserModel } from '../../dynamodb/models/users';
import { bindMethods } from '../../utils';
import { zodSchemas } from '../../validations';
import { DbService } from '../db/db.service';
import { ModelService } from '../model.service';
import {
    CreateInTargetDbInput,
    DeletItemFromTargetDb,
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
        const tenantDbUrl =
            input.targetDatabaseUrl ||
            (await this.dbService.getTenantDatabaseUrl({
                tenantId: input.tenantId,
                logger: input.logger,
            }));

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

        if (input.updateCmsUser && input.cmsUserUpdationInfo) {
            if (!input.cmsUserUpdationInfo.email) {
                throw new Error('Email is required to update CMS user');
            }
            const response = await UserModel.updateUser({
                tenantId: input.tenantId,
                email: input.cmsUserUpdationInfo.email,
                data: input.cmsUserUpdationInfo.data,
                logger: input.logger,
            });

            if (!response) {
                input.logger.error('Error updating user', { response });
            }
        }

        return result;
    }

    async updateItemInTargetDb(input: UpdateItemInTargetDbInput) {
        const tenantDbUrl =
            input.targetDatabaseUrl ||
            (await this.dbService.getTenantDatabaseUrl({
                tenantId: input.tenantId,
                logger: input.logger,
            }));

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

        if (input.updateCmsUser && input.cmsUserUpdationInfo) {
            if (!input.cmsUserUpdationInfo.email) {
                throw new Error('Email is required to update CMS user');
            }
            const response = await UserModel.updateUser({
                tenantId: input.tenantId,
                email: input.cmsUserUpdationInfo.email,
                data: input.cmsUserUpdationInfo.data,
                logger: input.logger,
            });

            if (!response) {
                input.logger.error('Error updating user', { response });
            }
        }

        return result;
    }

    async deleteItemFromTargetDb(input: DeletItemFromTargetDb) {
        const tenantDbUrl =
            input.targetDatabaseUrl ||
            (await this.dbService.getTenantDatabaseUrl({
                tenantId: input.tenantId,
                logger: input.logger,
            }));

        const { Model: TargetCollectionModel, connection } =
            this.modelService.createModelFromConnection({
                url: tenantDbUrl,
                modelName: input.targetCollection,
            });

        const result = await this.dbService.deleteItemUsingConnection({
            model: TargetCollectionModel,
            connection,
            filter: input.filter,
            logger: input.logger,
        });

        return result;
    }

    async readItemFromTargetDB(input: ReadItemFromTargetDB) {
        const tenantDbUrl =
            input.tenantDatabaseUrl ||
            (await this.dbService.getTenantDatabaseUrl({
                tenantId: input.tenantId,
                logger: input.logger,
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

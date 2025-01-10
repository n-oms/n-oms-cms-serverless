import { bindMethods } from '../../utils';
import { zodSchemas } from '../../validations';
import { DbService } from '../db/db.service';
import { ModelService } from '../model.service';
import { CreateInTargetDbInput } from './cmsCrud.types';

export class CmsCrudService {
    private readonly dbService: DbService;
    private readonly modelService: ModelService;

    constructor() {
        this.dbService = new DbService();
        bindMethods(this);
    }

    async createItemInTargetDb(input: CreateInTargetDbInput) {
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
}

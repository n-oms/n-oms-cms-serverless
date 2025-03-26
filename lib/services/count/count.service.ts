import { bindMethods } from '../../utils';
import { ModelService } from '../model.service';
import { CountResult, GetCountInput } from './count.types';

export class CountService {
    private readonly modelService: ModelService;

    constructor() {
        this.modelService = new ModelService();
        bindMethods(this);
    }

    /**
     * Get count of documents in a collection based on a filter
     */
    async getCount(input: GetCountInput): Promise<CountResult> {
        const { targetCollection, filter = {}, logger, tenantInfo } = input;

        logger.info('Getting count', {
            targetCollection,
            filter,
            tenantId: tenantInfo.tenantId,
        });

        try {
            const { Model, connection } = this.modelService.createModelFromConnection({
                modelName: targetCollection,
                url: tenantInfo.databaseUrl,
            });

            // Count documents matching the filter
            const count = await Model.countDocuments(filter).exec();

            // Close the connection after query
            if (connection) {
                await connection.close();
            }

            logger.info('Count completed', { count });

            return { count };
        } catch (error) {
            logger.error('Error getting count', { error });
            throw error;
        }
    }
}
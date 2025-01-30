import { Logger } from '@aws-lambda-powertools/logger';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { CmsCrudService } from '../../lib/services/cmsCrud/cmsCrud.service';
import { bindMethods, ILambdaService, parseSqsrecordBody } from '../../lib/utils';
import { CrudApiActions, CrudApiBody, crudApiBodySchema } from './types';

export class CmsCrudApiLambdaHandlerService implements ILambdaService {
    static cmsCrudApiLambdaService: CmsCrudApiLambdaHandlerService;
    private readonly cmsCrudService: CmsCrudService;
    logger: Logger;

    constructor() {
        this.logger = new Logger({ serviceName: this.constructor.name });
        this.cmsCrudService = new CmsCrudService();
        bindMethods(this);
    }

    async handler(event: SQSEvent) {
        this.logger.info('Event received', { event });

        const records = event.Records;

        if (records.length === 0) {
            this.logger.info('No records to process');
            return;
        }

        const processRecordPromises = records.map(
            async (record) => await this.processRecord({ record }),
        );

        await Promise.all(processRecordPromises);
    }

    async processRecord({ record }: { record: SQSRecord }) {
        const body = parseSqsrecordBody<CrudApiBody>({ record, schema: crudApiBodySchema });

        this.logger.info('Processing record', { body });

        switch (body.action) {
            case CrudApiActions.CREATE: {
                return await this.cmsCrudService.createItemInTargetDb({
                    data: body.data,
                    isDataValidationRequired: false,
                    targetCollection: body.targetCollection,
                    logger: this.logger,
                    tenantId: body.tenantId,
                });
            }
            case CrudApiActions.UPDATE: {
                return await this.cmsCrudService.updateItemInTargetDb({
                    data: body.data as Record<string, unknown>,
                    filter: body.filter || {},
                    isDataValidationRequired: false,
                    targetCollection: body.targetCollection,
                    logger: this.logger,
                    tenantId: body.tenantId,
                });
            }
            default: {
                throw new Error('Invalid action');
            }
        }
    }

    static getHandler() {
        if (!this.cmsCrudApiLambdaService) {
            this.cmsCrudApiLambdaService = new CmsCrudApiLambdaHandlerService();
        }
        return this.cmsCrudApiLambdaService.handler;
    }
}

export const handler = CmsCrudApiLambdaHandlerService.getHandler();

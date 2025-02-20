import { env } from '../../env';
import { bindMethods } from '../../utils';
import { CmsCrudService } from '../cmsCrud/cmsCrud.service';
import { CreateData, ReadData, UpdateData } from './tenantStore.types';
import { TenantStoreUtils } from './utils';

export class TenantStoreService {
    private readonly cmsCrudService: CmsCrudService;
    constructor() {
        this.cmsCrudService = new CmsCrudService();
        bindMethods(this);
    }
    async readData(input: ReadData) {
        const response = await this.cmsCrudService.readItemFromTargetDB({
            filter: input.filter || {},
            logger: input.logger,
            targetCollection: input.targetCollection,
            tenantDatabaseUrl: input.tenantInfo.databaseUrl,
            tenantId: input.tenantInfo.tenantId,
        });
        return response;
    }

    async createData(input: CreateData) {
        input.data.entityId = TenantStoreUtils.createEntityId();

        const response = await this.cmsCrudService.createItemInTargetDb({
            data: input.data,
            logger: input.logger,
            targetCollection: input.targetCollection,
            tenantId: input.tenantInfo.tenantId,
            targetDatabaseUrl: input.tenantInfo.databaseUrl,
        });
        if (input.addToBackOffice) {
            const backOfficedata = TenantStoreUtils.prepareBackOfficeData({
                data: input.data,
                targetCollection: input.targetCollection,
                tenantId: input.tenantInfo.tenantId,
            });
            await this.cmsCrudService.createItemInTargetDb({
                data: backOfficedata,
                logger: input.logger,
                targetCollection: 'org_entities',
                tenantId: input.tenantInfo.tenantId,
                targetDatabaseUrl: env.MULTI_TENANT_DB_URL,
            });
        }
        return response;
    }

    async updateData(input: UpdateData) {
        const response = await this.cmsCrudService.updateItemInTargetDb({
            data: input.data,
            logger: input.logger,
            targetCollection: input.targetCollection,
            tenantId: input.tenantInfo.tenantId,
            targetDatabaseUrl: input.tenantInfo.databaseUrl,
            filter: input.filter,
        });
        return response;
    }
}

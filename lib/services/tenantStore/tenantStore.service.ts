import { bindMethods } from '../../utils';
import { CmsCrudService } from '../cmsCrud/cmsCrud.service';
import { ReadData } from './tenantStore.types';

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
}

import { v4 as uuidv4 } from 'uuid';

export class TenantStoreUtils {
    static prepareBackOfficeData({
        data,
        targetCollection,
        tenantId,
    }: {
        data: Record<string, unknown>;
        targetCollection: string;
        tenantId: string;
    }) {
        return {
            ...data,
            tenantId,
            cmsEntityName: targetCollection,
        };
    }

    static createEntityId() {
        return `${Date.now().toString()}-${uuidv4()}`;
    }
}

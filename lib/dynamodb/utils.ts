export const sanitizeEntity = (entity: Record<string, unknown>) => {
    if (!entity) return entity;

    if (entity.PK) {
        delete entity.PK;
    }

    if (entity.SK) {
        delete entity.SK;
    }

    return entity;
};

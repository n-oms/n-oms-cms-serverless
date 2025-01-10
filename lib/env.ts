export const env = {
    REGION: process.env.REGION || 'us-east-1',
    STAGE: process.env.STAGE || 'dev',
    ACCOUNT_ID: process.env.ACCOUNT_ID,
    MULTI_TENANT_DB_URL: process.env.MULTI_TENANT_DB_URL,
};

export const DEPLOYMENT_ENVS = {
    MULTI_TENANT_DB_URL: '${env:MULTI_TENANT_DB_URL}',
};

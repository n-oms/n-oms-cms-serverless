// Envs should be added in both env and DEPLOYMENT_ENVS if they are used in lambdas

export const env = {
    REGION: process.env.REGION || 'us-east-1',
    STAGE: process.env.STAGE || 'dev',
    ACCOUNT_ID: process.env.ACCOUNT_ID,
    MULTI_TENANT_DB_URL: process.env.MULTI_TENANT_DB_URL,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
    WEBSOCKET_CONNECTIONS_TABLE: process.env.WEBSOCKET_CONNECTIONS_TABLE,
};

export const DEPLOYMENT_ENVS = {
    MULTI_TENANT_DB_URL: '${env:MULTI_TENANT_DB_URL}',
    DYNAMODB_TABLE_NAME: '${env:DYNAMODB_TABLE_NAME}',
    ACCOUNT_ID: '${env:ACCOUNT_ID}',
    REGION: '${env:REGION}',
    STAGE: '${env:STAGE}',
    WEBSOCKET_CONNECTIONS_TABLE: '${env:WEBSOCKET_CONNECTIONS_TABLE}',
};

import { APIGatewayProxyEvent } from 'aws-lambda';
import { lambdaResponse, parseApiGatewayEvent } from '../../lib/utils';
import { TenantStoreApiBodySchema } from '../../lib/validations';

export class PublicTenantApiHandler {
    async handler(event: APIGatewayProxyEvent) {
        const body = parseApiGatewayEvent({ event, schema: TenantStoreApiBodySchema });

        return lambdaResponse({ status: 200, data: { message: 'Hello World!' } });
    }
}

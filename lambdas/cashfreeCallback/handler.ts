import mongoose from 'mongoose';
import { DB_URLS } from '../../lib/constants';
import { queryStringToJson } from '../../lib/utils';

export const handler = async (event: any) => {
    const encodedDataString = event.body;

    const decodedDataString = atob(encodedDataString);

    const jsonData = queryStringToJson(decodedDataString);
    const connection = mongoose.createConnection(DB_URLS.MULTI_TENANT_DB_URL);

    const OrgEntityModel =
        connection.models['org_entities'] ||
        connection.model('org_entities', new mongoose.Schema({}, { strict: false }));

    const mandate = await OrgEntityModel.findOneAndUpdate(
        { subscriptionId: jsonData.cf_subscriptionId },
        { mandateProcessState: jsonData.cf_checkoutStatus },
    );
    await connection.close();

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': false,
        },
        body: JSON.stringify({ mandate: mandate }),
    };
};

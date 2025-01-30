import mongoose from 'mongoose';

export class ModelService {
    createModelFromConnection<T>({
        schema,
        url,
        modelName,
    }: {
        schema?: mongoose.Schema<T>;
        url: string;
        modelName: string;
    }) {
        const connection = mongoose.createConnection(url);

        let dbSchema = schema;

        if (!dbSchema) {
            dbSchema = new mongoose.Schema<T>({}, { strict: false, timestamps: true });
        }

        return { Model: connection.model<T>(modelName, dbSchema), connection };
    }
}

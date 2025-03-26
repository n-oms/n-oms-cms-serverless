import { bindMethods } from '../../utils';
import { ModelService } from '../model.service';
import { GetProjectionInput, ProjectionResult } from './projection.types';

export class ProjectionService {
    private readonly modelService: ModelService;

    constructor() {
        this.modelService = new ModelService();
        bindMethods(this);
    }

    /**
     * Get only specific properties from documents in a collection
     * Supports nested properties using dot notation (e.g., "payment.amount")
     */
    async getProjection(input: GetProjectionInput): Promise<ProjectionResult> {
        const { targetCollection, properties, filter = {}, logger, tenantInfo } = input;

        logger.info('Getting projection', {
            targetCollection,
            properties,
            filter,
            tenantId: tenantInfo.tenantId,
        });

        try {
            const { Model, connection } = this.modelService.createModelFromConnection({
                modelName: targetCollection,
                url: tenantInfo.databaseUrl,
            });

            // Create MongoDB projection object
            const projection: Record<string, number> = {};
            properties.forEach(prop => {
                projection[prop] = 1;
            });

            // Find documents matching the filter with projection
            const documents = await Model.find(filter, projection).lean().exec();

            // Close the connection after query
            if (connection) {
                await connection.close();
            }

            // Extract nested properties if needed
            const result = documents.map(doc => {
                const projectedDoc: Record<string, any> = {};
                
                properties.forEach(prop => {
                    // Handle nested properties
                    if (prop.includes('.')) {
                        const value = this.getNestedValue(doc, prop);
                        if (value !== undefined) {
                            this.setNestedValue(projectedDoc, prop, value);
                        }
                    } else {
                        // Handle top-level properties
                        if (prop in doc) {
                            projectedDoc[prop] = doc[prop];
                        }
                    }
                });
                
                return projectedDoc;
            });

            logger.info('Projection completed', { resultCount: result.length });

            return { data: result };
        } catch (error) {
            logger.error('Error getting projection', { error });
            throw error;
        }
    }

    /**
     * Get a value from a nested object using a dot-notation path
     * e.g., getNestedValue(obj, "payment.amount")
     */
    private getNestedValue(obj: any, path: string): any {
        if (!obj || !path) return undefined;
        
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }

    /**
     * Set a value in a nested object using a dot-notation path
     * e.g., setNestedValue(obj, "payment.amount", 100)
     */
    private setNestedValue(obj: any, path: string, value: any): void {
        if (!obj || !path) return;
        
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        let current = obj;
        
        for (const key of keys) {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
    }
}
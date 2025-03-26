import { bindMethods } from '../../utils';
import { ModelService } from '../model.service';
import { AccumulatePropertyInput, AccumulationResult } from './aggregation.types';

export class AggregationService {
    private readonly modelService: ModelService;

    constructor() {
        this.modelService = new ModelService();
        bindMethods(this);
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
     * Accumulates/sums the values of a specific property in a collection
     * Handles both numeric values and strings that can be converted to numbers
     * Supports nested properties using dot notation (e.g., "payment.amount")
     */
    async accumulateProperty(input: AccumulatePropertyInput): Promise<AccumulationResult> {
        const { targetCollection, property, filter = {}, logger, tenantInfo } = input;

        logger.info('Accumulating property', {
            targetCollection,
            property,
            filter,
            tenantId: tenantInfo.tenantId,
        });

        try {
            const { Model, connection } = this.modelService.createModelFromConnection({
                modelName: targetCollection,
                url: tenantInfo.databaseUrl,
            });

            // Find all documents matching the filter
            const documents = await Model.find(filter).lean().exec();

            // Close the connection after query
            if (connection) {
                await connection.close();
            }

            let sum = 0;
            let count = 0;
            const matchedCount = documents.length;

            for (const doc of documents) {
                // Get the value using our dot notation path resolver
                const value = this.getNestedValue(doc, property);
                
                // Skip if property doesn't exist or is null/undefined
                if (value === undefined || value === null) {
                    continue;
                }
                
                // Handle different types of values
                if (typeof value === 'number') {
                    sum += value;
                    count++;
                } else if (typeof value === 'string') {
                    // Try to convert string to number
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        sum += numValue;
                        count++;
                    }
                } else if (typeof value === 'boolean') {
                    // Convert boolean to 0 or 1
                    sum += value ? 1 : 0;
                    count++;
                }
            }

            // Ensure the sum is properly rounded to handle floating point issues
            sum = parseFloat(sum.toFixed(10));
            
            // Calculate average
            const averageValue = count > 0 ? parseFloat((sum / count).toFixed(10)) : 0;

            logger.info('Accumulation completed', {
                sum,
                count,
                matchedCount,
                averageValue,
            });

            return {
                sum,
                count,
                matchedCount,
                averageValue,
            };
        } catch (error) {
            logger.error('Error accumulating property', { error });
            throw error;
        }
    }
}
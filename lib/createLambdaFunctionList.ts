import { FunctionDefinition } from './types';
import { AWS } from '@serverless/typescript';

export const createLambdaFunctionList = ({
    lambdas,
}: {
    lambdas: Record<string, { config: FunctionDefinition }>;
}): AWS['functions'] => {
    const fns = {};
    for (const [key, value] of Object.entries(lambdas)) {
        fns[key] = value.config;
    }
    return fns;
};

import mongoose from 'mongoose';

export type Tenant = {
    tenantId: string;
    orgName: string;
    description: string;
    country: string;
    email: string;
    phoneNumber?: string;
    tenantDatabaseUrl?: string;
};

export const tenantSchema = new mongoose.Schema<Tenant>({
    tenantId: { type: String, required: true },
    orgName: { type: String, required: true },
    description: { type: String },
    country: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    tenantDatabaseUrl: { type: String },
});

export const TenantModel =
    (mongoose.models.tenants as mongoose.Model<Tenant>) ||
    mongoose.model<Tenant>('tenants', tenantSchema);

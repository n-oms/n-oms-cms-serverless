# Multi-Tenant Serverless CMS

A serverless application built on AWS Lambda for handling multi-tenant content management operations with MongoDB and DynamoDB integration.

## Architecture Overview

This application follows a serverless architecture pattern with:

- **API Gateway**: Routes HTTP requests to Lambda functions
- **Lambda Functions**: Process requests and perform business logic
- **DynamoDB**: Stores tenant configuration and user information
- **MongoDB**: Stores tenant-specific data with multi-tenant isolation
- **SQS**: Handles asynchronous processing for CRUD operations

The system is designed to support multiple tenants with isolated data, allowing for:
- Tenant registration and management
- User authentication and authorization
- CRUD operations on tenant-specific collections
- Data aggregation, counting, and projection

## Key Features

- **Multi-tenancy**: Complete isolation of tenant data
- **Authentication**: API Key-based authentication with tenant context
- **Middleware Pattern**: For request processing and authentication
- **Extensible**: Built with a modular approach for easy feature additions
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Data Operations**: Comprehensive APIs for CRUD, aggregation, counting, and projection

## Folder Structure

```
├── lambdas/                    # Lambda functions
│   ├── admin/                  # Tenant administration
│   ├── aggregation/            # Data aggregation operations
│   ├── cashfreeCallback/       # Payment gateway callback handler
│   ├── count/                  # Document counting operations
│   ├── crud/                   # SQS-based CRUD operations
│   ├── projection/             # Property extraction from documents
│   ├── store/                  # Direct CRUD operations
│   ├── users/                  # User management
│   └── index.ts                # Lambda exports
├── lib/                        # Shared code and utilities
│   ├── constants.ts            # System constants
│   ├── createLambdaHandler.ts  # Lambda wrapper with error handling
│   ├── dynamodb/               # DynamoDB client and models
│   ├── env.ts                  # Environment configuration
│   ├── errors/                 # Custom error types
│   ├── middlewares/            # Request middlewares
│   ├── schemas/                # MongoDB schemas
│   ├── services/               # Business logic services
│   │   ├── admin/              # Admin operations service
│   │   ├── aggregation/        # Property aggregation service
│   │   ├── apiKey/             # API key management service
│   │   ├── cmsCrud/            # CRUD operation service
│   │   ├── count/              # Document counting service
│   │   ├── db/                 # Database connection service
│   │   ├── projection/         # Property projection service
│   │   ├── tenantStore/        # Tenant-specific store service
│   │   └── user/               # User management service
│   └── utils.ts                # Utility functions
├── resources/                  # CloudFormation resources
├── scripts/                    # Utility scripts
│   └── lambda.sh               # Script to generate new Lambda boilerplate
└── serverless.ts               # Serverless Framework configuration
```

## Lambda Functions

| Lambda | Description | Endpoint |
|--------|-------------|----------|
| **admin** | Tenant administration operations | POST /admin |
| **aggregation** | Aggregates numerical data in collections | POST /aggregation |
| **cashfreeCallback** | Handles payment gateway callbacks | POST /cashfree-callback |
| **count** | Counts documents with filters | POST /count |
| **crud** | Asynchronous CRUD operations via SQS | (SQS triggered) |
| **projection** | Extracts specific properties from documents | POST /projection |
| **store** | Direct CRUD operations via REST | POST /store |
| **users** | User management operations | POST /users |

## Core Services

| Service | Description |
|---------|-------------|
| **AggregationService** | Handles data aggregation operations across collections |
| **ApiKeyService** | Manages API key generation and validation |
| **CmsCrudService** | Handles CRUD operations with schema validation |
| **CmsTenantStoreAdminService** | Manages tenant registration and configuration |
| **CountService** | Provides document counting functionality |
| **DbService** | Manages database connections and operations |
| **ProjectionService** | Extracts specific properties from collection documents |
| **TenantStoreService** | Provides tenant-specific CRUD operations |
| **UserService** | Manages user operations with DynamoDB integration |

## Prerequisites

- Node.js 18+
- AWS CLI (configured with appropriate permissions)
- Serverless Framework (`npm install -g serverless`)
- MongoDB instance (for tenant data)
- An AWS account with permissions to create:
  - Lambda functions
  - DynamoDB tables
  - SQS queues
  - API Gateway endpoints

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```
   MULTI_TENANT_DB_URL=<your-mongodb-connection-string>
   DYNAMODB_TABLE_NAME=<your-dynamodb-table-name>
   REGION=<aws-region>
   ACCOUNT_ID=<your-aws-account-id>
   STAGE=<deployment-stage>
   ```
4. Deploy the application:
   ```bash
   serverless deploy
   ```

## Development

### Creating a New Lambda Function

Use the provided script to generate a new Lambda function boilerplate:

```bash
./scripts/lambda.sh my-new-function
```

This will create:
- `lambdas/my-new-function/handler.ts`
- `lambdas/my-new-function/index.ts`
- Update the main `lambdas/index.ts` with the new export

### API Authentication

Most API endpoints require authentication via the `x-api-key` header, which contains a base64-encoded tenant ID. The `StoreAuthMiddleware` handles validation and attaches tenant information to the request.

## API Usage Examples

### Aggregation API

The Aggregation API allows you to calculate sums and averages of numeric fields in your collections.

**Request:**
```json
{
  "action": "ACCUMULATE",
  "targetCollection": "payments",
  "property": "amount",
  "filter": { "status": "completed" }
}
```

**Nested Property Example:**
```json
{
  "action": "ACCUMULATE",
  "targetCollection": "users",
  "property": "payment.amount", 
  "filter": { "payment.status": "approved" }
}
```

**Response:**
```json
{
  "sum": 2546.75,
  "count": 15,
  "matchedCount": 18,
  "averageValue": 169.78
}
```

This response indicates:
- 18 documents matched the filter criteria
- 15 of those documents had valid numeric values for the "amount" property
- The sum of those values is 2546.75
- The average value is 169.78

### Count API

The Count API allows you to count documents in a collection based on filters.

**Request:**
```json
{
  "action": "GET_COUNT",
  "targetCollection": "orders",
  "filter": { "status": "pending" }
}
```

**Response:**
```json
{
  "count": 42
}
```

### Projection API

The Projection API allows you to extract specific fields from documents, creating a focused view of your data.

**Request (single property):**
```json
{
  "action": "GET_PROJECTION",
  "targetCollection": "payments",
  "properties": ["amount"],
  "filter": {}
}
```

**Response:**
```json
{
  "data": [
    { "amount": 150.75 },
    { "amount": 49.99 }
  ]
}
```

**Request (multiple properties):**
```json
{
  "action": "GET_PROJECTION",
  "targetCollection": "payments",
  "properties": ["amount", "status"],
  "filter": {}
}
```

**Response:**
```json
{
  "data": [
    { "amount": 150.75, "status": "completed" },
    { "amount": 49.99, "status": "pending" }
  ]
}
```

**Nested Properties Example:**
```json
{
  "action": "GET_PROJECTION",
  "targetCollection": "users",
  "properties": ["name", "payment.amount", "payment.currency"],
  "filter": { "payment.status": "approved" }
}
```

**Response:**
```json
{
  "data": [
    {
      "name": "John Doe",
      "payment": {
        "amount": "199.99",
        "currency": "USD"
      }
    },
    {
      "name": "Jane Smith",
      "payment": {
        "amount": "149.50",
        "currency": "EUR"
      }
    }
  ]
}
```

### Store API

The Store API provides CRUD operations directly on collections.

**Create Example:**
```json
{
  "action": "CREATE",
  "targetCollection": "products",
  "data": {
    "name": "Sample Product",
    "price": 99.99,
    "description": "A sample product"
  }
}
```

**Read Example:**
```json
{
  "action": "READ",
  "targetCollection": "products",
  "filter": { "price": { "$gt": 50 } }
}
```

**Update Example:**
```json
{
  "action": "UPDATE",
  "targetCollection": "products",
  "filter": { "_id": "product123" },
  "data": {
    "price": 89.99,
    "inStock": true
  }
}
```

**Delete Example:**
```json
{
  "action": "DELETE",
  "targetCollection": "products",
  "filter": { "_id": "product123" }
}
```

## Advanced Features

### Nested Property Support

All APIs support both top-level and nested properties using dot notation:

- For **Aggregation**: Specify `"property": "payment.amount"` to sum up nested amount values
- For **Projection**: Include `"properties": ["user.name", "payment.amount"]` to extract nested fields
- For **Filtering**: Use paths like `"filter": { "payment.status": "completed" }` to query on nested fields

### Data Validation

CRUD operations can optionally validate data against predefined Zod schemas:

```typescript
// Define your schema in lib/validations
export const productSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  description: z.string().optional()
});

// Reference it in your CRUD operation
{
  "action": "CREATE",
  "targetCollection": "products",
  "data": {...},
  "isDataValidationRequired": true
}
```

## Error Handling

The system uses custom error types for different scenarios:

- `BadRequestException`: For invalid request parameters
- `HttpError`: Base class for HTTP errors
- `NotFoundException`: For when resources are not found

All errors are properly logged and returned with appropriate HTTP status codes.

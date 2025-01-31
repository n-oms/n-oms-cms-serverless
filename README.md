# Project Overview

This repository contains a Serverless application. Each Lambda function lives in the `lambdas` folder, with common code and utilities in the `lib` folder.

## Folder Structure

- **lambdas/**  
  Contains subfolders for each Lambda. Each folder has:
    - `handler.ts` (entry point)
    - `index.ts` (exports function configuration)
- **lib/**  
  Contains common services, utilities, and types (e.g., DB service).
- **scripts/**  
  Includes shell scripts such as `lambda.sh` for generating new Lambdas.
- **serverless.ts**  
  Configures deployment settings (runtime, environment, etc.).
- **Readme.md**  
  Project documentation.

## Prerequisites

- Node.js 18+
- AWS CLI (configured)
- Serverless Framework (`npm install -g serverless`)

## Setup

1. Clone this repository
2. Install dependencies:
    ```bash
    npm install
    ```

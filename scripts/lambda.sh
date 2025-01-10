#!/usr/bin/env bash

LAMBDA_NAME="$1"
if [ -z "$LAMBDA_NAME" ]; then
  echo "Usage: ./createLambda.sh <lambdaName>"
  exit 1
fi

LAMBDA_DIR="$(cd "$(dirname "$0")"/.. && pwd)/lambdas/$LAMBDA_NAME"
mkdir -p "$LAMBDA_DIR"

# Create handler.ts
HANDLER_FILE="$LAMBDA_DIR/handler.ts"
cat << 'EOF' > "$HANDLER_FILE"

export const handler = (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  return;
};
EOF

# Create index.ts for the new lambda
INDEX_FILE="$LAMBDA_DIR/index.ts"
cat << EOF > "$INDEX_FILE"
import { FunctionDefinition } from "../../lib/types";

export const config: FunctionDefinition = {
  handler: "lambdas/${LAMBDA_NAME}/handler.handler"
};
EOF

# Modify the root index.ts to export the new lambda
MAIN_INDEX_FILE="$(cd "$(dirname "$0")"/.. && pwd)/lambdas/index.ts"
echo -e "\nexport * as ${LAMBDA_NAME} from \"./${LAMBDA_NAME}\"" >> "$MAIN_INDEX_FILE"

echo "Created $HANDLER_FILE"
echo "Created $INDEX_FILE"
echo "Updated $MAIN_INDEX_FILE"
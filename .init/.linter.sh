#!/bin/bash
cd /home/kavia/workspace/code-generation/expense-splitter-with-receipts-158093-158102/expense_splitter_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


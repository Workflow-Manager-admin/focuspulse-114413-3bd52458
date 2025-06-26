#!/bin/bash
cd /home/kavia/workspace/code-generation/focuspulse-114413-3bd52458/frontend_app_workspace/frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


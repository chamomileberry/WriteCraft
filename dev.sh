
#!/bin/bash
# Development startup script - Sentry is loaded via --import flag
NODE_ENV=development NODE_OPTIONS="--import tsx/esm --import ./server/instrument.ts" tsx server/index.ts

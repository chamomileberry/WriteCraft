
#!/bin/bash
# Development startup script
# Increase Node.js memory limit to prevent out-of-memory errors during startup
# Default heap size is ~512MB, we increase to 1GB for production stability
export NODE_OPTIONS="--max-old-space-size=1024"
NODE_ENV=development tsx server/index.ts

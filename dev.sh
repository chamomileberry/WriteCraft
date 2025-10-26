
#!/bin/bash
# Development startup script
NODE_ENV=development tsx --import ./server/instrument.ts server/index.ts

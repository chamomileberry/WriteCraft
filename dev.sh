#!/bin/bash
# Development startup script with Sentry pre-loading
NODE_ENV=development NODE_OPTIONS='--import ./server/instrument.mjs' tsx server/index.ts

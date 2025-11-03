import { createApp } from './app';
import { setupCollaborationServer } from './collaboration';
import { logger } from './lib/logger';
import http from 'http';
import { AddressInfo } from 'net';

// Graceful shutdown and error handling
const setupProcessHooks = (server: http.Server) => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:');
    logger.error(err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at promise:');
    logger.error(promise);
    logger.error('Reason:');
    logger.error(reason);
  });

  const gracefulShutdown = (signal: string) => {
    logger.info(`[SHUTDOWN] Received ${signal}, closing server gracefully.`);
    server.close(() => {
      logger.info('[SHUTDOWN] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

// --- Simplified Argument Parsing ---
const getArgValue = (argName: string): string | undefined => {
  const argIndex = process.argv.indexOf(argName);
  if (argIndex > -1 && process.argv[argIndex + 1]) {
    return process.argv[argIndex + 1];
  }
  return undefined;
};

const startServer = async () => {
  try {
    // 1. Parse command-line arguments for port and host (simplified)
    const portArg = getArgValue('--port') || getArgValue('-p');
    const hostArg = getArgValue('--host') || getArgValue('-h');

    // Use provided port/host or fall back to environment/defaults
    const port = portArg ? parseInt(portArg, 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 8080);
    const host = hostArg || process.env.HOST || '0.0.0.0';

    logger.info(`[Startup] Attempting to start server on ${host}:${port}`);

    // 2. Create the Express application instance
    logger.info('[Startup] Creating Express application...');
    const { expressApp, creationTimeMs } = await createApp();
    logger.info(`[Startup] Express application created in ${creationTimeMs}ms`);

    // 3. Create a single HTTP server from the Express app
    const server = http.createServer(expressApp);

    // 4. Initialize WebSocket server on the same HTTP server
    setupCollaborationServer(server);
    logger.info('[Collaboration] WebSocket server initialized.');

    // 5. Setup graceful shutdown hooks
    setupProcessHooks(server);
    
    // 6. Start the server
    server.listen(port, host, () => {
      const address = server.address() as AddressInfo;
      logger.info(`[Startup] Server listening on http://${address.address}:${address.port}`);
    });

    server.on('error', (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        logger.error(`[Startup] FATAL: Port ${port} is already in use.`);
        process.exit(1);
      } else {
        logger.error('[Startup] An unexpected server error occurred:');
        logger.error(e);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('[Startup] A fatal error occurred during server initialization:');
    logger.error(error);
    process.exit(1);
  }
};

startServer();

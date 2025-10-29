// IMPORTANT: Sentry must be imported first before any other modules
import "./instrument.mjs";

import { createApp, setServerInstance } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import * as keyRotationService from "./services/apiKeyRotationService";

(async () => {
  const startTime = Date.now();
  console.log('[Startup] Application initialization started');
  
  let app;
  let server;
  
  try {
    const result = await createApp();
    app = result.app;
    server = result.server;
    console.log(`[Startup] App created in ${Date.now() - startTime}ms`);

    // Register server instance for graceful shutdown
    setServerInstance(server);

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    const viteStartTime = Date.now();
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log(`[Startup] Vite setup completed in ${Date.now() - viteStartTime}ms`);
    } else {
      serveStatic(app);
      console.log(`[Startup] Static serving configured in ${Date.now() - viteStartTime}ms`);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Wrap server.listen in try-catch for proper error handling
    await new Promise<void>((resolve, reject) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, async () => {
        console.log(`[Startup] Server listening on port ${port} - Total startup time: ${Date.now() - startTime}ms`);
        log(`serving on port ${port}`);
        
        // Initialize API key rotation tracking
        try {
          await keyRotationService.initializeCommonKeys();
          console.log('[API Key Rotation] Initialized rotation tracking for common keys');
          
          // Run initial rotation status check
          await keyRotationService.checkRotationStatus();
          console.log('[API Key Rotation] Initial rotation status check completed');
          
          // Schedule rotation checks every 24 hours
          setInterval(async () => {
            try {
              await keyRotationService.checkRotationStatus();
              console.log('[API Key Rotation] Scheduled rotation status check completed');
            } catch (error) {
              console.error('[API Key Rotation] Error in scheduled check:', error);
            }
          }, 24 * 60 * 60 * 1000); // 24 hours
        } catch (error) {
          console.error('[API Key Rotation] Failed to initialize:', error);
        }
        
        resolve();
      }).on('error', (err: Error) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('[Startup] Fatal error during application initialization:', error);
    
    // Clean up server socket if it exists
    if (server) {
      try {
        console.log('[Startup] Attempting to close server socket...');
        await new Promise<void>((resolve) => {
          server.close(() => {
            console.log('[Startup] Server socket closed successfully');
            resolve();
          });
          // Force close after timeout
          setTimeout(() => {
            console.log('[Startup] Force closing server socket after timeout');
            resolve();
          }, 5000);
        });
      } catch (closeError) {
        console.error('[Startup] Error closing server socket:', closeError);
      }
    }
    
    console.error('[Startup] Exiting due to fatal error');
    process.exit(1);
  }
})();

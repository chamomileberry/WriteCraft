// Sentry is initialized via --import flag in dev.sh and deployment config
// DO NOT import "./instrument" here as it will initialize Sentry twice

import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import * as keyRotationService from "./services/apiKeyRotationService";

(async () => {
  const { app, server } = await createApp();

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
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
  });
})();

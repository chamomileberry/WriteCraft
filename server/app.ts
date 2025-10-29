import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import { applySecurityMiddleware } from "./app-security";
import Sentry from "./instrument";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import { setupCollaborationServer } from "./collaboration";

// Global error handlers to prevent server crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Capture in Sentry
  Sentry.captureException(reason);
  // Log the error but don't crash the server in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Stack trace:', reason);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Capture in Sentry
  Sentry.captureException(error);
  // Log the error but don't crash in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Stack trace:', error.stack);
  }
  // In production, you might want to gracefully shutdown
  // For now, we log and continue
});

export async function createApp() {
  const app = express();
  
  // Health check endpoint for deployment monitoring
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
  });
  
  // HTTP request logging with pino
  app.use(pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url?.startsWith('/assets') || req.url?.startsWith('/@vite')
    },
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }));
  
  // Parse request bodies first (required for sanitization to work)
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Apply security middleware AFTER body parsing so req.body exists
  applySecurityMiddleware(app);

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  const server = await registerRoutes(app);

  // Setup WebSocket collaboration server
  setupCollaborationServer(server);

  // Sentry error handler - must be after routes but before other error handlers
  Sentry.setupExpressErrorHandler(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Explicitly capture the exception in Sentry (in case setupExpressErrorHandler didn't catch it)
    Sentry.captureException(err);

    // Log the error for debugging but don't throw after response is sent
    console.error('Error handler caught:', err);
    res.status(status).json({ message });
  });

  return { app, server };
}

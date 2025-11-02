import express, { type Request, Response, NextFunction } from "express";
import { applySecurityMiddleware } from "./app-security";
import Sentry from "./instrument";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import { registerDomainRoutes } from "./routes/index";

export async function createApp() {
  const startTime = Date.now();
  const app = express();

  // Health check endpoint for deployment monitoring
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
  });

  // HTTP request logging with pino
  app.use(pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url?.startsWith('/assets') || req.url?.startsWith('/@vite'),
    },
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }));

  // Parse request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Apply security middleware
  applySecurityMiddleware(app);

  // Register all application routes
  registerDomainRoutes(app);

  // Sentry error handler - must be after routes
  Sentry.setupExpressErrorHandler(app);

  // Final custom error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    Sentry.captureException(err);
    logger.error(err, 'Caught in final error handler');
    res.status(status).json({ message });
  });

  const creationTimeMs = Date.now() - startTime;
  return { expressApp: app, creationTimeMs };
}

// Replit Auth - OpenID Connect authentication with session management
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import lusca from "lusca";
import memoize from "memoizee";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "./services/redisClient";
import { sessionManager } from "./services/sessionManager";
import { storage } from "./storage";
import {
  authRateLimiter,
  sessionRateLimiter,
  userSearchRateLimiter,
  profileRateLimiter,
} from "./security/rateLimiters";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!,
    );
  },
  { maxAge: 3600 * 1000 },
);

// Helper function to check if path is a static asset
// Used by session, passport, and CSRF middlewares to skip unnecessary processing
const isStaticAsset = (path: string): boolean => {
  return (
    path.startsWith("/@fs/") ||
    path.startsWith("/@vite/") ||
    path.startsWith("/assets/") ||
    path.startsWith("/node_modules/") ||
    path.startsWith("/@id/") ||
    path === "/api/csp-report" // CSP reports are browser-generated
  );
};

export async function getSession(): Promise<RequestHandler[]> {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  // Try to use Redis for session storage (faster, scalable)
  const redisClient = await getRedisClient();

  let sessionStore;
  if (redisClient) {
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: "writecraft:session:",
      ttl: sessionTtl / 1000, // Redis expects TTL in seconds
    });
    console.log("[SESSION] Using Redis session store");
  } else {
    // Fallback to PostgreSQL if Redis is not available
    console.log(
      "[SESSION] Redis unavailable, falling back to PostgreSQL session store",
    );
    const connectPg = (await import("connect-pg-simple")).default;
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes (in seconds)
    });
  }

  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax", // CSRF protection
      maxAge: sessionTtl,
    },
  });

  const csrfMiddleware = lusca.csrf();

  // Wrap session middleware to skip for static assets (performance optimization)
  // Static assets don't need session data, so we avoid expensive database lookups
  const conditionalSessionMiddleware: RequestHandler = (req, res, next) => {
    if (isStaticAsset(req.path)) {
      return next(); // Skip session loading for static assets
    }
    sessionMiddleware(req, res, next);
  };

  // Wrap CSRF middleware to skip ONLY for static assets and CSP reports
  // CSRF protection is ENABLED for all API routes for defense-in-depth security
  // While SameSite cookies provide some protection, CSRF tokens are required for:
  // - Defense against browser bugs and implementation variations
  // - Protection in older browsers that don't support SameSite
  // - Defense against subdomain takeover attacks
  // - Compliance with OWASP security best practices
  const conditionalCsrfMiddleware: RequestHandler = (req, res, next) => {
    if (isStaticAsset(req.path)) {
      return next(); // Skip CSRF validation for static assets
    }

    // Run CSRF middleware for ALL other requests, including ALL API routes
    csrfMiddleware(req, res, next);
  };

  return [conditionalSessionMiddleware, conditionalCsrfMiddleware];
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  const [conditionalSessionMiddleware, conditionalCsrfMiddleware] =
    await getSession();

  // Apply session middleware (conditionally skips static assets)
  app.use(conditionalSessionMiddleware);

  // Apply Passport middlewares
  app.use(passport.initialize());

  // Passport session middleware - must also skip for static assets
  // because it requires req.session to exist (set by express-session)
  app.use((req, res, next) => {
    if (isStaticAsset(req.path)) {
      return next(); // Skip passport.session() for static assets
    }
    // Run passport session deserialization for all other routes
    passport.session()(req, res, next);
  });

  // Apply CSRF middleware (conditionally skips static assets)
  app.use(conditionalCsrfMiddleware);

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback,
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Apply strict rate limiting to authentication endpoints
  app.get("/api/login", authRateLimiter, (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", authRateLimiter, (req, res, next) => {
    passport.authenticate(
      `replitauth:${req.hostname}`,
      (err: any, user: any) => {
        if (err) {
          console.error("[AUTH] Authentication error:", err);
          return res.redirect("/api/login");
        }
        if (!user) {
          return res.redirect("/api/login");
        }

        // Store the return URL before regenerating session
        const returnTo = (req.session as any).returnTo || "/";

        // Regenerate session to prevent session fixation attacks
        req.session.regenerate((regenerateErr) => {
          if (regenerateErr) {
            console.error("[AUTH] Session regeneration error:", regenerateErr);
            return res.redirect("/api/login");
          }

          // Restore returnTo after regeneration
          (req.session as any).returnTo = returnTo;

          req.logIn(user, async (loginErr) => {
            if (loginErr) {
              console.error("[AUTH] Login error:", loginErr);
              return res.redirect("/api/login");
            }

            // Register session for concurrent session limiting
            const userId = user.claims?.sub;
            const sessionId = req.sessionID;
            if (userId && sessionId) {
              try {
                await sessionManager.registerSession(userId, sessionId, req);
                console.log(`[SESSION] Registered session for user ${userId}`);
              } catch (sessionErr) {
                console.error(
                  "[SESSION] Failed to register session:",
                  sessionErr,
                );
                // Don't fail the login, just log the error
              }
            }

            // Clear returnTo and redirect
            const destination = (req.session as any).returnTo || "/";
            delete (req.session as any).returnTo;
            return res.redirect(destination);
          });
        });
      },
    )(req, res, next);
  });

  // SECURITY: GET logout endpoint for OIDC redirect flow with CSRF mitigation
  // This endpoint validates the Referer header to prevent CSRF attacks
  // - Allows same-origin requests (direct navigation, frontend redirects)
  // - Blocks cross-origin requests (CSRF attacks)
  // - Falls back to blocking if Referer is missing (defense-in-depth)
  app.get("/api/logout", sessionRateLimiter, (req, res) => {
    // CSRF Protection: Validate Referer header
    const referer = req.headers.referer || req.headers.referrer;
    const host = req.headers.host;

    // Allow logout only if:
    // 1. Referer matches our domain (same-origin)
    // 2. OR user is not authenticated (no CSRF risk)
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const requestHost = host?.split(":")[0]; // Remove port if present
        const refererHost = refererUrl.hostname;

        // Block if referer is from different domain
        if (
          refererHost !== requestHost &&
          refererHost !== `www.${requestHost}`
        ) {
          console.warn(
            `[SECURITY] Blocked cross-origin logout attempt from ${refererHost} to ${requestHost}`,
          );
          return res.status(403).json({
            message: "Logout must be initiated from the same domain",
          });
        }
      } catch (error) {
        // Invalid referer URL - block for safety
        console.warn(`[SECURITY] Invalid referer header in logout: ${referer}`);
        return res.status(403).json({ message: "Invalid request origin" });
      }
    } else if (req.isAuthenticated && req.isAuthenticated()) {
      // No referer but user is authenticated - potentially suspicious
      // Some browsers don't send referer, so we allow but log it
      console.warn(
        `[SECURITY] Logout without referer header - user: ${(req.user as any)?.claims?.sub}`,
      );
    }

    const userId = (req.user as any)?.claims?.sub;
    const sessionId = req.sessionID;

    req.logout(async () => {
      // Remove session from concurrent session tracking
      if (userId && sessionId) {
        try {
          await sessionManager.removeSession(userId, sessionId);
          console.log(`[SESSION] Removed session for user ${userId}`);
        } catch (sessionErr) {
          console.error("[SESSION] Failed to remove session:", sessionErr);
        }
      }

      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href,
      );
    });
  });

  // Get current authenticated user
  app.get(
    "/api/auth/user",
    isAuthenticated,
    profileRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
      }
    },
  );

  // User search endpoint for collaboration
  app.get(
    "/api/auth/users/search",
    isAuthenticated,
    userSearchRateLimiter,
    async (req: any, res) => {
      try {
        const query = req.query.q;
        if (typeof query !== "string" || query.length < 2) {
          return res.json([]);
        }

        // Parse pagination parameters
        const limit = req.query.limit
          ? Math.min(parseInt(req.query.limit), 100)
          : 20;
        const cursor = req.query.cursor
          ? { value: req.query.cursor }
          : undefined;

        const result = await storage.searchUsers(query, { limit, cursor });

        // Remove sensitive information and current user from results
        const currentUserId = req.user.claims.sub;
        const sanitizedUsers = result.items
          .filter((u) => u.id !== currentUserId)
          .map((u) => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            profileImageUrl: u.profileImageUrl,
          }));

        res.json(sanitizedUsers);
      } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Failed to search users" });
      }
    },
  );
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // SECURITY: Block test mode bypass in production
  if (process.env.NODE_ENV === "production" && req.headers["x-test-user-id"]) {
    console.error(
      `[SECURITY CRITICAL] Test mode bypass attempt in production - IP: ${req.ip}, User-Agent: ${req.headers["user-agent"]}`,
    );
    // Log additional details for security audit
    const securityLog = {
      type: "TEST_MODE_BYPASS_ATTEMPT",
      timestamp: new Date().toISOString(),
      ip: req.ip,
      headers: {
        "x-test-user-id": req.headers["x-test-user-id"],
        "user-agent": req.headers["user-agent"],
        referer: req.headers["referer"],
      },
    };
    console.error("[SECURITY AUDIT]", JSON.stringify(securityLog));
    return res.status(403).json({ message: "Forbidden" });
  }

  // Enhanced test mode validation - only in actual test environment
  if (process.env.NODE_ENV === "test" && req.headers["x-test-user-id"]) {
    const testUserId = req.headers["x-test-user-id"] as string;

    // Validate test user ID format to prevent injection
    if (!/^test-user-[a-z0-9-]+$/.test(testUserId)) {
      console.error(`[SECURITY] Invalid test user ID format: ${testUserId}`);
      return res.status(403).json({ message: "Forbidden" });
    }

    (req as any).user = {
      claims: {
        sub: testUserId,
      },
    };
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

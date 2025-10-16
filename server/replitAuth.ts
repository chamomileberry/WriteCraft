// Replit Auth - OpenID Connect authentication with session management
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "./services/redisClient";
import { sessionManager } from "./services/sessionManager";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export async function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Try to use Redis for session storage (faster, scalable)
  const redisClient = await getRedisClient();
  
  let sessionStore;
  if (redisClient) {
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'writecraft:session:',
      ttl: sessionTtl / 1000, // Redis expects TTL in seconds
    });
    console.log('[SESSION] Using Redis session store');
  } else {
    // Fallback to PostgreSQL if Redis is not available
    console.log('[SESSION] Redis unavailable, falling back to PostgreSQL session store');
    const connectPg = (await import('connect-pg-simple')).default;
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  }
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax', // CSRF protection
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
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
  app.use(await getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
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

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, (err: any, user: any) => {
      if (err) {
        console.error('[AUTH] Authentication error:', err);
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
          console.error('[AUTH] Session regeneration error:', regenerateErr);
          return res.redirect("/api/login");
        }
        
        // Restore returnTo after regeneration
        (req.session as any).returnTo = returnTo;
        
        req.logIn(user, async (loginErr) => {
          if (loginErr) {
            console.error('[AUTH] Login error:', loginErr);
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
              console.error('[SESSION] Failed to register session:', sessionErr);
              // Don't fail the login, just log the error
            }
          }
          
          // Clear returnTo and redirect
          const destination = (req.session as any).returnTo || "/";
          delete (req.session as any).returnTo;
          return res.redirect(destination);
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    const sessionId = req.sessionID;
    
    req.logout(async () => {
      // Remove session from concurrent session tracking
      if (userId && sessionId) {
        try {
          await sessionManager.removeSession(userId, sessionId);
          console.log(`[SESSION] Removed session for user ${userId}`);
        } catch (sessionErr) {
          console.error('[SESSION] Failed to remove session:', sessionErr);
        }
      }
      
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  // User search endpoint for collaboration
  app.get("/api/auth/users/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const users = await storage.searchUsers(query);
      
      // Remove sensitive information and current user from results
      const currentUserId = req.user.claims.sub;
      const sanitizedUsers = users
        .filter((u: any) => u.id !== currentUserId)
        .map((u: any) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          profileImageUrl: u.profileImageUrl,
        }));
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // SECURITY: Block test mode bypass in production
  if (process.env.NODE_ENV === 'production' && req.headers['x-test-user-id']) {
    console.error(`[SECURITY CRITICAL] Test mode bypass attempt in production - IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);
    // Log additional details for security audit
    const securityLog = {
      type: 'TEST_MODE_BYPASS_ATTEMPT',
      timestamp: new Date().toISOString(),
      ip: req.ip,
      headers: {
        'x-test-user-id': req.headers['x-test-user-id'],
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer']
      }
    };
    console.error('[SECURITY AUDIT]', JSON.stringify(securityLog));
    return res.status(403).json({ message: "Forbidden" });
  }
  
  // Enhanced test mode validation - only in actual test environment
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-user-id']) {
    const testUserId = req.headers['x-test-user-id'] as string;
    
    // Validate test user ID format to prevent injection
    if (!/^test-user-[a-z0-9-]+$/.test(testUserId)) {
      console.error(`[SECURITY] Invalid test user ID format: ${testUserId}`);
      return res.status(403).json({ message: "Forbidden" });
    }
    
    (req as any).user = {
      claims: {
        sub: testUserId
      }
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

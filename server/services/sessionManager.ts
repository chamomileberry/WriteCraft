import { getRedisClient } from './redisClient';
import type { Request } from 'express';

const MAX_CONCURRENT_SESSIONS = 3;
const SESSION_PREFIX = 'writecraft:user_sessions:';

interface SessionInfo {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Session Manager Service
 * Manages concurrent session limiting per user
 */
export class SessionManager {
  private inMemorySessions: Map<string, SessionInfo[]> = new Map();

  /**
   * Register a new session for a user
   * Automatically removes oldest session if limit exceeded
   */
  async registerSession(userId: string, sessionId: string, req: Request): Promise<void> {
    const sessionInfo: SessionInfo = {
      sessionId,
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };

    const redisClient = await getRedisClient();

    if (redisClient) {
      await this.registerSessionRedis(userId, sessionInfo, redisClient, req);
    } else {
      await this.registerSessionMemory(userId, sessionInfo, req);
    }
  }

  /**
   * Register session using Redis
   */
  private async registerSessionRedis(
    userId: string,
    sessionInfo: SessionInfo,
    redisClient: any,
    req: Request
  ): Promise<void> {
    const key = `${SESSION_PREFIX}${userId}`;
    
    // Get existing sessions
    const sessionsData = await redisClient.get(key);
    let sessions: SessionInfo[] = sessionsData ? JSON.parse(sessionsData) : [];

    // Remove current session if it already exists (refresh)
    sessions = sessions.filter(s => s.sessionId !== sessionInfo.sessionId);

    // Add new session
    sessions.push(sessionInfo);

    // Sort by creation time (oldest first)
    sessions.sort((a, b) => a.createdAt - b.createdAt);

    // Remove oldest sessions if limit exceeded and destroy them in session store
    while (sessions.length > MAX_CONCURRENT_SESSIONS) {
      const removed = sessions.shift();
      if (removed && req.sessionStore) {
        console.log(`[SESSION] Evicting oldest session for user ${userId}: ${removed.sessionId}`);
        // Actually destroy the session in the session store
        req.sessionStore.destroy(removed.sessionId, (err) => {
          if (err) {
            console.error(`[SESSION] Failed to destroy session ${removed.sessionId}:`, err);
          }
        });
      }
    }

    // Store updated sessions (expire after 7 days)
    await redisClient.setEx(key, 7 * 24 * 60 * 60, JSON.stringify(sessions));
  }

  /**
   * Register session using in-memory storage (fallback)
   */
  private async registerSessionMemory(userId: string, sessionInfo: SessionInfo, req: Request): Promise<void> {
    let sessions = this.inMemorySessions.get(userId) || [];

    // Remove current session if it already exists (refresh)
    sessions = sessions.filter(s => s.sessionId !== sessionInfo.sessionId);

    // Add new session
    sessions.push(sessionInfo);

    // Sort by creation time (oldest first)
    sessions.sort((a, b) => a.createdAt - b.createdAt);

    // Remove oldest sessions if limit exceeded and destroy them in session store
    while (sessions.length > MAX_CONCURRENT_SESSIONS) {
      const removed = sessions.shift();
      if (removed && req.sessionStore) {
        console.log(`[SESSION] Evicting oldest session for user ${userId}: ${removed.sessionId}`);
        // Actually destroy the session in the session store
        req.sessionStore.destroy(removed.sessionId, (err) => {
          if (err) {
            console.error(`[SESSION] Failed to destroy session ${removed.sessionId}:`, err);
          }
        });
      }
    }

    this.inMemorySessions.set(userId, sessions);
  }

  /**
   * Remove a session for a user
   */
  async removeSession(userId: string, sessionId: string): Promise<void> {
    const redisClient = await getRedisClient();

    if (redisClient) {
      await this.removeSessionRedis(userId, sessionId, redisClient);
    } else {
      await this.removeSessionMemory(userId, sessionId);
    }
  }

  /**
   * Remove session using Redis
   */
  private async removeSessionRedis(
    userId: string,
    sessionId: string,
    redisClient: any
  ): Promise<void> {
    const key = `${SESSION_PREFIX}${userId}`;
    
    const sessionsData = await redisClient.get(key);
    if (!sessionsData) return;

    let sessions: SessionInfo[] = JSON.parse(sessionsData);
    sessions = sessions.filter(s => s.sessionId !== sessionId);

    if (sessions.length > 0) {
      await redisClient.setEx(key, 7 * 24 * 60 * 60, JSON.stringify(sessions));
    } else {
      await redisClient.del(key);
    }
  }

  /**
   * Remove session using in-memory storage
   */
  private async removeSessionMemory(userId: string, sessionId: string): Promise<void> {
    const sessions = this.inMemorySessions.get(userId);
    if (!sessions) return;

    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    
    if (filtered.length > 0) {
      this.inMemorySessions.set(userId, filtered);
    } else {
      this.inMemorySessions.delete(userId);
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const redisClient = await getRedisClient();

    if (redisClient) {
      const key = `${SESSION_PREFIX}${userId}`;
      const sessionsData = await redisClient.get(key);
      return sessionsData ? JSON.parse(sessionsData) : [];
    } else {
      return this.inMemorySessions.get(userId) || [];
    }
  }

  /**
   * Check if a session is valid (not exceeded limit)
   */
  async isSessionValid(userId: string, sessionId: string): Promise<boolean> {
    const sessions = await this.getUserSessions(userId);
    return sessions.some(s => s.sessionId === sessionId);
  }

  /**
   * Update last activity time for a session
   */
  async updateActivity(userId: string, sessionId: string): Promise<void> {
    const redisClient = await getRedisClient();

    if (redisClient) {
      const key = `${SESSION_PREFIX}${userId}`;
      const sessionsData = await redisClient.get(key);
      if (!sessionsData) return;

      let sessions: SessionInfo[] = JSON.parse(sessionsData);
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.lastActivity = Date.now();
        await redisClient.setEx(key, 7 * 24 * 60 * 60, JSON.stringify(sessions));
      }
    } else {
      const sessions = this.inMemorySessions.get(userId);
      if (sessions) {
        const session = sessions.find(s => s.sessionId === sessionId);
        if (session) {
          session.lastActivity = Date.now();
        }
      }
    }
  }
}

export const sessionManager = new SessionManager();

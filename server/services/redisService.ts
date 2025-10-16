import { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

/**
 * Get or create Redis client
 */
export async function getRedisClient(): Promise<RedisClient> {
  if (redisClient) {
    return redisClient;
  }

  // Use Replit Redis URL if available, otherwise use default local connection
  const redisUrl = process.env.REDIS_URL || process.env.REPLIT_DB_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('[REDIS] Max reconnection attempts reached');
          return new Error('Max reconnection attempts reached');
        }
        const delay = Math.min(retries * 100, 3000);
        console.log(`[REDIS] Reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('[REDIS ERROR]', err);
  });

  redisClient.on('connect', () => {
    console.log('[REDIS] Connected successfully');
  });

  redisClient.on('ready', () => {
    console.log('[REDIS] Client ready');
  });

  redisClient.on('reconnecting', () => {
    console.log('[REDIS] Reconnecting...');
  });

  await redisClient.connect();

  return redisClient;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[REDIS] Connection closed');
  }
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('[REDIS] Health check failed:', error);
    return false;
  }
}

/**
 * Fallback in-memory store for when Redis is unavailable
 * Used as a graceful degradation strategy
 */
export class InMemoryStore extends Map<string, any> {
  private ttlMap: Map<string, NodeJS.Timeout> = new Map();

  setEx(key: string, ttl: number, value: any): void {
    this.set(key, value);
    
    // Clear existing timeout if any
    const existingTimeout = this.ttlMap.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.delete(key);
      this.ttlMap.delete(key);
    }, ttl * 1000);

    this.ttlMap.set(key, timeout);
  }

  async get(key: string): Promise<any> {
    return super.get(key);
  }

  async del(key: string): Promise<void> {
    const timeout = this.ttlMap.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.ttlMap.delete(key);
    }
    this.delete(key);
  }

  async findKeys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(super.keys()).filter(key => regex.test(key));
  }
}

// Singleton instance for fallback
export const inMemoryStore = new InMemoryStore();

import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn('[REDIS] REDIS_URL not configured - sessions will use in-memory fallback');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('[REDIS] Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('[REDIS] Client error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[REDIS] Connected successfully');
    });

    redisClient.on('reconnecting', () => {
      console.log('[REDIS] Reconnecting...');
    });

    await redisClient.connect();
    
    console.log('[REDIS] Client initialized and connected');
    return redisClient;
  } catch (error) {
    console.error('[REDIS] Failed to initialize:', error);
    redisClient = null;
    return null;
  }
}

// Initialize Redis on module load (async, won't block)
getRedisClient().catch(err => {
  console.error('[REDIS] Initialization error:', err);
});

export { redisClient };

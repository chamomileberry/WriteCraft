import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;
let redisWarningShown = false;

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = getEnvOptional('REDIS_URL');

  if (!redisUrl) {
    // Only show warning once to reduce log noise
    if (!redisWarningShown) {
      console.log(
        "[REDIS] Redis not configured - using in-memory session tracking (PostgreSQL stores session data)",
      );
      redisWarningShown = true;
    }
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("[REDIS] Max reconnection attempts reached");
            return new Error("Max reconnection attempts reached");
          }
          return Math.min(retries * 100, 3000);
        },
        // Add connection timeout to prevent hanging
        connectTimeout: 5000,
      },
    });

    redisClient.on("error", (err) => {
      console.error("[REDIS] Client error:", err);
    });

    redisClient.on("connect", () => {
      console.log("[REDIS] Connected successfully");
    });

    redisClient.on("reconnecting", () => {
      console.log("[REDIS] Reconnecting...");
    });

    // Set a timeout for the connection attempt
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Redis connection timeout after 5 seconds")),
        5000,
      );
    });

    await Promise.race([connectPromise, timeoutPromise]);

    console.log("[REDIS] Client initialized and connected");
    return redisClient;
  } catch (error) {
    console.error("[REDIS] Failed to initialize:", error);
    // Clean up the failed client
    if (redisClient) {
      try {
        await redisClient.disconnect();
      } catch (disconnectError) {
        console.error(
          "[REDIS] Error disconnecting failed client:",
          disconnectError,
        );
      }
    }
    redisClient = null;
    return null;
  }
}

export { redisClient };

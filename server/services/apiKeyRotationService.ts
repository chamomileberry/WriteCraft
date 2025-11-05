import { db } from "../db";
import {
  apiKeyRotations,
  apiKeyRotationAudit,
  securityAlerts,
} from "@shared/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface ApiKeyRotationConfig {
  keyName: string;
  keyType: "external_api" | "encryption" | "signing" | "database";
  description: string;
  rotationIntervalDays?: number;
}

/**
 * Registers an API key for rotation tracking
 */
export async function registerApiKey(
  config: ApiKeyRotationConfig,
  userId?: string,
): Promise<void> {
  const rotationIntervalDays = config.rotationIntervalDays || 90;
  const now = new Date();
  const nextRotationDue = new Date(now);
  nextRotationDue.setDate(nextRotationDue.getDate() + rotationIntervalDays);

  // Check if key already exists
  const existing = await db.query.apiKeyRotations.findFirst({
    where: eq(apiKeyRotations.keyName, config.keyName),
  });

  if (existing) {
    console.log(`[API Key Rotation] Key ${config.keyName} already registered`);
    return;
  }

  // Insert new key rotation record
  await db.insert(apiKeyRotations).values({
    keyName: config.keyName,
    keyType: config.keyType,
    description: config.description,
    rotationIntervalDays,
    lastRotatedAt: now,
    nextRotationDue,
    rotationStatus: "current",
    rotationCount: 0,
  });

  // Log the registration
  const keyRecord = await db.query.apiKeyRotations.findFirst({
    where: eq(apiKeyRotations.keyName, config.keyName),
  });

  if (keyRecord) {
    await db.insert(apiKeyRotationAudit).values({
      keyRotationId: keyRecord.id,
      action: "created",
      performedBy: userId || null,
      notes: `Registered ${config.keyName} for rotation tracking`,
    });
  }

  console.log(
    `[API Key Rotation] Registered ${config.keyName} for rotation every ${rotationIntervalDays} days`,
  );
}

/**
 * Check for keys due for rotation and update their status
 */
export async function checkRotationStatus(): Promise<void> {
  const now = new Date();

  // Find all active keys
  const keys = await db.query.apiKeyRotations.findMany({
    where: eq(apiKeyRotations.isActive, true),
  });

  for (const key of keys) {
    const daysUntilRotation = Math.ceil(
      (key.nextRotationDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let newStatus: "current" | "due" | "overdue" = "current";
    let shouldNotify = false;

    if (daysUntilRotation <= 0) {
      newStatus = "overdue";
      shouldNotify = true;
    } else if (daysUntilRotation <= 7) {
      newStatus = "due";
      shouldNotify = true;
    }

    // Update status if changed
    if (key.rotationStatus !== newStatus) {
      await db
        .update(apiKeyRotations)
        .set({
          rotationStatus: newStatus,
          updatedAt: now,
        })
        .where(eq(apiKeyRotations.id, key.id));

      console.log(
        `[API Key Rotation] ${key.keyName} status updated to ${newStatus}`,
      );
    }

    // Send notification if needed and not already sent recently
    if (
      shouldNotify &&
      (!key.notificationSent ||
        shouldResendNotification(key.lastNotificationSentAt))
    ) {
      await sendRotationNotification(key);
    }
  }
}

/**
 * Determine if we should resend a notification (every 7 days for overdue keys)
 */
function shouldResendNotification(lastSentAt: Date | null): boolean {
  if (!lastSentAt) return true;

  const daysSinceLastNotification = Math.ceil(
    (Date.now() - lastSentAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysSinceLastNotification >= 7;
}

/**
 * Send rotation notification and create security alert
 */
async function sendRotationNotification(
  key: typeof apiKeyRotations.$inferSelect,
): Promise<void> {
  const now = new Date();
  const daysOverdue = Math.ceil(
    (now.getTime() - key.nextRotationDue.getTime()) / (1000 * 60 * 60 * 24),
  );

  let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
  let alertType = "KEY_ROTATION_DUE";
  let message = "";

  if (daysOverdue > 30) {
    severity = "CRITICAL";
    alertType = "KEY_ROTATION_OVERDUE";
    message = `CRITICAL: ${key.keyName} is ${daysOverdue} days overdue for rotation`;
  } else if (daysOverdue > 0) {
    severity = "HIGH";
    alertType = "KEY_ROTATION_OVERDUE";
    message = `${key.keyName} is ${daysOverdue} days overdue for rotation`;
  } else {
    severity = "MEDIUM";
    message = `${key.keyName} is due for rotation within 7 days`;
  }

  // Create security alert
  await db.insert(securityAlerts).values({
    alertType,
    severity,
    message,
    details: {
      keyName: key.keyName,
      keyType: key.keyType,
      description: key.description,
      nextRotationDue: key.nextRotationDue.toISOString(),
      daysOverdue,
      rotationCount: key.rotationCount,
    },
  });

  // Update notification status
  await db
    .update(apiKeyRotations)
    .set({
      notificationSent: true,
      lastNotificationSentAt: now,
      updatedAt: now,
    })
    .where(eq(apiKeyRotations.id, key.id));

  // Log the notification
  await db.insert(apiKeyRotationAudit).values({
    keyRotationId: key.id,
    action: "notification_sent",
    notes: message,
  });

  console.log(
    `[API Key Rotation] Notification sent for ${key.keyName}: ${message}`,
  );
}

/**
 * Mark a key as rotated
 */
export async function markKeyRotated(
  keyName: string,
  userId?: string,
): Promise<void> {
  const key = await db.query.apiKeyRotations.findFirst({
    where: and(
      eq(apiKeyRotations.keyName, keyName),
      eq(apiKeyRotations.isActive, true),
    ),
  });

  if (!key) {
    throw new Error(`Key ${keyName} not found in rotation tracking`);
  }

  const now = new Date();
  const nextRotationDue = new Date(now);
  nextRotationDue.setDate(nextRotationDue.getDate() + key.rotationIntervalDays);

  // Update rotation record
  await db
    .update(apiKeyRotations)
    .set({
      lastRotatedAt: now,
      nextRotationDue,
      rotationStatus: "current",
      rotationCount: (key.rotationCount || 0) + 1,
      lastRotatedBy: userId || null,
      notificationSent: false,
      lastNotificationSentAt: null,
      updatedAt: now,
    })
    .where(eq(apiKeyRotations.id, key.id));

  // Log the rotation
  await db.insert(apiKeyRotationAudit).values({
    keyRotationId: key.id,
    action: "rotated",
    performedBy: userId || null,
    notes: `Key rotated. Next rotation due: ${nextRotationDue.toISOString()}`,
  });

  console.log(
    `[API Key Rotation] ${keyName} marked as rotated. Next rotation: ${nextRotationDue.toISOString()}`,
  );
}

/**
 * Get all keys and their rotation status
 */
export async function getAllKeyRotations() {
  return await db.query.apiKeyRotations.findMany({
    where: eq(apiKeyRotations.isActive, true),
    orderBy: (table) => [table.nextRotationDue],
  });
}

/**
 * Get rotation history for a specific key
 */
export async function getKeyRotationHistory(keyName: string) {
  const key = await db.query.apiKeyRotations.findFirst({
    where: eq(apiKeyRotations.keyName, keyName),
  });

  if (!key) {
    return null;
  }

  const history = await db.query.apiKeyRotationAudit.findMany({
    where: eq(apiKeyRotationAudit.keyRotationId, key.id),
    orderBy: (table) => [sql`${table.timestamp} DESC`],
  });

  return {
    key,
    history,
  };
}

/**
 * Initialize rotation tracking for common keys
 */
export async function initializeCommonKeys(): Promise<void> {
  const commonKeys: ApiKeyRotationConfig[] = [
    {
      keyName: "ANTHROPIC_API_KEY",
      keyType: "external_api",
      description: "Anthropic Claude API key for AI writing assistance",
      rotationIntervalDays: 90,
    },
    {
      keyName: "MFA_ENCRYPTION_KEY",
      keyType: "encryption",
      description: "Encryption key for MFA secrets storage",
      rotationIntervalDays: 90,
    },
    {
      keyName: "SESSION_SECRET",
      keyType: "signing",
      description: "Secret for session signing and encryption",
      rotationIntervalDays: 90,
    },
  ];

  for (const keyConfig of commonKeys) {
    await registerApiKey(keyConfig);
  }
}

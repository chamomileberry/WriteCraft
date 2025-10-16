import { db } from "../db";
import { 
  intrusionAttempts, 
  ipBlocks, 
  securityAlerts,
  type InsertIntrusionAttempt,
  type InsertIpBlock,
  type InsertSecurityAlert
} from "@shared/schema";
import { eq, and, gte, lt, isNull, or, desc, sql } from "drizzle-orm";

export type AttackType = 
  | 'BRUTE_FORCE'
  | 'SQL_INJECTION' 
  | 'XSS'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_PATTERN';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertType =
  | 'MULTIPLE_FAILED_LOGINS'
  | 'SUSPICIOUS_PATTERN'
  | 'IP_BLOCKED'
  | 'PRIVILEGE_ESCALATION'
  | 'INJECTION_ATTEMPT';

/**
 * Intrusion Detection Service
 * Monitors, detects, and responds to security threats
 */
export class IntrusionDetectionService {
  
  // Thresholds for auto-blocking
  private static readonly BRUTE_FORCE_THRESHOLD = 5; // Failed logins in window
  private static readonly BRUTE_FORCE_WINDOW_MINUTES = 15;
  private static readonly RATE_LIMIT_THRESHOLD = 10; // Rate limit violations in window
  private static readonly RATE_LIMIT_WINDOW_MINUTES = 15;
  private static readonly INJECTION_THRESHOLD = 3; // SQL/XSS attempts in window
  private static readonly INJECTION_WINDOW_MINUTES = 60;
  
  /**
   * Log an intrusion attempt
   */
  static async logAttempt(attempt: {
    userId?: string;
    ipAddress: string;
    userAgent?: string;
    attackType: AttackType;
    endpoint?: string;
    payload?: string;
    severity: Severity;
    blocked?: boolean;
  }): Promise<void> {
    try {
      // Insert intrusion attempt
      await db.insert(intrusionAttempts).values({
        userId: attempt.userId || null,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent || null,
        attackType: attempt.attackType,
        endpoint: attempt.endpoint || null,
        payload: attempt.payload || null,
        severity: attempt.severity,
        blocked: attempt.blocked || false,
      });
      
      // Check if we should auto-block this IP
      await this.checkAutoBlock(attempt.ipAddress, attempt.attackType);
      
      // Create alert if severity is high or critical
      if (attempt.severity === 'HIGH' || attempt.severity === 'CRITICAL') {
        await this.createAlert({
          alertType: this.getAlertType(attempt.attackType),
          severity: attempt.severity,
          message: `${attempt.attackType} detected from IP ${attempt.ipAddress}`,
          details: {
            ipAddress: attempt.ipAddress,
            userId: attempt.userId,
            endpoint: attempt.endpoint,
            attackType: attempt.attackType,
          },
        });
      }
    } catch (error) {
      console.error('[IDS] Failed to log intrusion attempt:', error);
    }
  }
  
  /**
   * Check if IP should be auto-blocked based on pattern detection
   */
  private static async checkAutoBlock(ipAddress: string, attackType: AttackType): Promise<void> {
    try {
      // Check if already blocked
      const existingBlock = await this.isIpBlocked(ipAddress);
      if (existingBlock) return;
      
      let shouldBlock = false;
      let reason = '';
      let severity: Severity = 'MEDIUM';
      let blockDurationMinutes = 60; // Default 1 hour
      
      // Pattern detection based on attack type
      switch (attackType) {
        case 'BRUTE_FORCE': {
          const count = await this.getRecentAttemptCount(
            ipAddress, 
            'BRUTE_FORCE', 
            this.BRUTE_FORCE_WINDOW_MINUTES
          );
          
          if (count >= this.BRUTE_FORCE_THRESHOLD) {
            shouldBlock = true;
            reason = `Brute force attack detected: ${count} failed login attempts in ${this.BRUTE_FORCE_WINDOW_MINUTES} minutes`;
            severity = 'HIGH';
            blockDurationMinutes = 240; // 4 hours for brute force
          }
          break;
        }
        
        case 'SQL_INJECTION':
        case 'XSS': {
          const count = await this.getRecentAttemptCount(
            ipAddress,
            attackType,
            this.INJECTION_WINDOW_MINUTES
          );
          
          if (count >= this.INJECTION_THRESHOLD) {
            shouldBlock = true;
            reason = `${attackType} attack detected: ${count} injection attempts in ${this.INJECTION_WINDOW_MINUTES} minutes`;
            severity = 'CRITICAL';
            blockDurationMinutes = 1440; // 24 hours for injection attacks
          }
          break;
        }
        
        case 'RATE_LIMIT_EXCEEDED': {
          const count = await this.getRecentAttemptCount(
            ipAddress,
            'RATE_LIMIT_EXCEEDED',
            this.RATE_LIMIT_WINDOW_MINUTES
          );
          
          if (count >= this.RATE_LIMIT_THRESHOLD) {
            shouldBlock = true;
            reason = `Excessive rate limit violations: ${count} violations in ${this.RATE_LIMIT_WINDOW_MINUTES} minutes`;
            severity = 'MEDIUM';
            blockDurationMinutes = 120; // 2 hours for rate limiting
          }
          break;
        }
      }
      
      if (shouldBlock) {
        await this.blockIp({
          ipAddress,
          reason,
          severity,
          durationMinutes: blockDurationMinutes,
        });
      }
    } catch (error) {
      console.error('[IDS] Failed to check auto-block:', error);
    }
  }
  
  /**
   * Get count of recent intrusion attempts for an IP
   */
  private static async getRecentAttemptCount(
    ipAddress: string,
    attackType: AttackType,
    windowMinutes: number
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);
    
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(intrusionAttempts)
      .where(
        and(
          eq(intrusionAttempts.ipAddress, ipAddress),
          eq(intrusionAttempts.attackType, attackType),
          gte(intrusionAttempts.createdAt, cutoffTime)
        )
      );
    
    return result[0]?.count || 0;
  }
  
  /**
   * Block an IP address
   */
  static async blockIp(params: {
    ipAddress: string;
    reason: string;
    severity: Severity;
    durationMinutes?: number; // Null means permanent
    blockedBy?: string; // Admin user ID for manual blocks
  }): Promise<void> {
    try {
      const expiresAt = params.durationMinutes
        ? new Date(Date.now() + params.durationMinutes * 60 * 1000)
        : null;
      
      await db.insert(ipBlocks).values({
        ipAddress: params.ipAddress,
        reason: params.reason,
        severity: params.severity,
        expiresAt,
        autoBlocked: !params.blockedBy, // Auto-blocked if no admin specified
        blockedBy: params.blockedBy || null,
        isActive: true,
      });
      
      // Create alert for IP block
      await this.createAlert({
        alertType: 'IP_BLOCKED',
        severity: params.severity,
        message: `IP ${params.ipAddress} has been blocked: ${params.reason}`,
        details: {
          ipAddress: params.ipAddress,
          reason: params.reason,
          durationMinutes: params.durationMinutes,
          autoBlocked: !params.blockedBy,
        },
      });
      
      console.log(`[IDS] Blocked IP ${params.ipAddress}: ${params.reason}`);
    } catch (error) {
      console.error('[IDS] Failed to block IP:', error);
    }
  }
  
  /**
   * Check if an IP is currently blocked
   */
  static async isIpBlocked(ipAddress: string): Promise<boolean> {
    try {
      const now = new Date();
      
      const blocks = await db
        .select()
        .from(ipBlocks)
        .where(
          and(
            eq(ipBlocks.ipAddress, ipAddress),
            eq(ipBlocks.isActive, true),
            or(
              isNull(ipBlocks.expiresAt),
              gte(ipBlocks.expiresAt, now)
            )
          )
        )
        .limit(1);
      
      return blocks.length > 0;
    } catch (error) {
      console.error('[IDS] Failed to check IP block status:', error);
      return false;
    }
  }
  
  /**
   * Unblock an IP address
   */
  static async unblockIp(ipAddress: string, adminUserId?: string): Promise<void> {
    try {
      await db
        .update(ipBlocks)
        .set({ isActive: false })
        .where(
          and(
            eq(ipBlocks.ipAddress, ipAddress),
            eq(ipBlocks.isActive, true)
          )
        );
      
      console.log(`[IDS] Unblocked IP ${ipAddress} by ${adminUserId || 'system'}`);
    } catch (error) {
      console.error('[IDS] Failed to unblock IP:', error);
    }
  }
  
  /**
   * Create a security alert
   */
  private static async createAlert(alert: {
    alertType: AlertType;
    severity: Severity;
    message: string;
    details?: any;
  }): Promise<void> {
    try {
      await db.insert(securityAlerts).values({
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        details: alert.details || null,
        acknowledged: false,
      });
      
      console.error(`[SECURITY ALERT] ${alert.severity}: ${alert.message}`);
    } catch (error) {
      console.error('[IDS] Failed to create security alert:', error);
    }
  }
  
  /**
   * Get unacknowledged security alerts
   */
  static async getUnacknowledgedAlerts(limit: number = 50): Promise<any[]> {
    try {
      return await db
        .select()
        .from(securityAlerts)
        .where(eq(securityAlerts.acknowledged, false))
        .orderBy(desc(securityAlerts.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('[IDS] Failed to get alerts:', error);
      return [];
    }
  }
  
  /**
   * Acknowledge a security alert
   */
  static async acknowledgeAlert(alertId: string, adminUserId: string): Promise<void> {
    try {
      await db
        .update(securityAlerts)
        .set({
          acknowledged: true,
          acknowledgedBy: adminUserId,
          acknowledgedAt: new Date(),
        })
        .where(eq(securityAlerts.id, alertId));
    } catch (error) {
      console.error('[IDS] Failed to acknowledge alert:', error);
    }
  }
  
  /**
   * Get recent intrusion attempts for monitoring
   */
  static async getRecentAttempts(limit: number = 100): Promise<any[]> {
    try {
      return await db
        .select()
        .from(intrusionAttempts)
        .orderBy(desc(intrusionAttempts.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('[IDS] Failed to get intrusion attempts:', error);
      return [];
    }
  }
  
  /**
   * Get currently blocked IPs
   */
  static async getBlockedIps(): Promise<any[]> {
    try {
      const now = new Date();
      
      return await db
        .select()
        .from(ipBlocks)
        .where(
          and(
            eq(ipBlocks.isActive, true),
            or(
              isNull(ipBlocks.expiresAt),
              gte(ipBlocks.expiresAt, now)
            )
          )
        )
        .orderBy(desc(ipBlocks.blockedAt));
    } catch (error) {
      console.error('[IDS] Failed to get blocked IPs:', error);
      return [];
    }
  }
  
  /**
   * Map attack type to alert type
   */
  private static getAlertType(attackType: AttackType): AlertType {
    switch (attackType) {
      case 'BRUTE_FORCE':
        return 'MULTIPLE_FAILED_LOGINS';
      case 'SQL_INJECTION':
      case 'XSS':
        return 'INJECTION_ATTEMPT';
      case 'UNAUTHORIZED_ACCESS':
        return 'PRIVILEGE_ESCALATION';
      default:
        return 'SUSPICIOUS_PATTERN';
    }
  }
  
  /**
   * Clean up expired IP blocks
   * Should be run periodically (e.g., via cron job)
   */
  static async cleanupExpiredBlocks(): Promise<void> {
    try {
      const now = new Date();
      
      await db
        .update(ipBlocks)
        .set({ isActive: false })
        .where(
          and(
            eq(ipBlocks.isActive, true),
            lt(ipBlocks.expiresAt, now)
          )
        );
      
      console.log('[IDS] Cleaned up expired IP blocks');
    } catch (error) {
      console.error('[IDS] Failed to cleanup expired blocks:', error);
    }
  }
}

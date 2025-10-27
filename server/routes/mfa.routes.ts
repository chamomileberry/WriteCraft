import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import * as mfaService from '../services/mfaService';
import { SecurityAuditLog } from '../security';
import { z } from 'zod';
import { emailService } from '../services/emailService';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Validation schemas
const verifyTokenSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits').regex(/^\d{6}$/, 'Token must contain only digits'),
});

const verifyBackupCodeSchema = z.object({
  code: z.string().min(8, 'Invalid backup code format'),
});

/**
 * GET /api/auth/mfa/status
 * Check if user has MFA enabled
 */
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const enabled = await mfaService.isMFAEnabled(userId);

    res.json({ enabled });
  } catch (error) {
    console.error('Error checking MFA status:', error);
    res.status(500).json({ error: 'Failed to check MFA status' });
  }
});

/**
 * POST /api/auth/mfa/setup
 * Initialize MFA setup for a user
 */
router.post('/setup', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const email = (req.user as any).claims.email || 'user@writecraft.com';

    // Check if MFA is already enabled
    const alreadyEnabled = await mfaService.isMFAEnabled(userId);
    if (alreadyEnabled) {
      return res.status(400).json({ error: 'MFA is already enabled' });
    }

    const setup = await mfaService.setupMFA(userId, email);

    SecurityAuditLog.log({
      type: 'AUTH_FAILURE',
      userId,
      ip: req.ip,
      details: `MFA setup initiated for ${email}`,
      severity: 'LOW',
    });

    res.json({
      qrCode: setup.qrCode,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
    });
  } catch (error) {
    console.error('Error setting up MFA:', error);
    SecurityAuditLog.log({
      type: 'AUTH_FAILURE',
      userId: (req.user as any)?.claims.sub,
      ip: req.ip,
      details: `MFA setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'MEDIUM',
    });
    res.status(500).json({ error: 'Failed to set up MFA' });
  }
});

/**
 * POST /api/auth/mfa/verify
 * Verify MFA token and enable MFA (first-time setup)
 */
router.post('/verify', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const parseResult = verifyTokenSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid token format',
        details: parseResult.error.issues 
      });
    }

    const { token } = parseResult.data;

    const isValid = await mfaService.verifyMFAToken(userId, token);

    if (!isValid) {
      SecurityAuditLog.log({
        type: 'AUTH_FAILURE',
        userId,
        ip: req.ip,
        details: 'Invalid MFA token attempt during setup',
        severity: 'MEDIUM',
      });
      return res.status(401).json({ error: 'Invalid authentication code' });
    }

    // Enable MFA after successful first verification
    await mfaService.enableMFA(userId);

    SecurityAuditLog.log({
      type: 'AUTH_FAILURE',
      userId,
      ip: req.ip,
      details: 'MFA enabled successfully',
      severity: 'LOW',
    });

    // Send MFA enabled email
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user?.email) {
      const userName = user.firstName 
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.email.split('@')[0];
      
      await emailService.sendMfaEnabled(user.email, {
        userName,
        timestamp: new Date(),
        ipAddress: req.ip || 'Unknown',
      });
    }

    res.json({ success: true, message: 'MFA enabled successfully' });
  } catch (error) {
    console.error('Error verifying MFA token:', error);
    res.status(500).json({ error: 'Failed to verify MFA token' });
  }
});

/**
 * POST /api/auth/mfa/verify-login
 * Verify MFA token during login
 */
router.post('/verify-login', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const parseResult = verifyTokenSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid token format',
        details: parseResult.error.issues 
      });
    }

    const { token } = parseResult.data;

    const isValid = await mfaService.verifyMFAToken(userId, token);

    if (!isValid) {
      SecurityAuditLog.log({
        type: 'AUTH_FAILURE',
        userId,
        ip: req.ip,
        details: 'Failed MFA login attempt',
        severity: 'MEDIUM',
      });
      return res.status(401).json({ error: 'Invalid authentication code' });
    }

    SecurityAuditLog.log({
      type: 'AUTH_FAILURE',
      userId,
      ip: req.ip,
      details: 'Successful MFA login',
      severity: 'LOW',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying MFA login:', error);
    res.status(500).json({ error: 'Failed to verify authentication code' });
  }
});

/**
 * POST /api/auth/mfa/verify-backup
 * Verify backup code (for account recovery)
 */
router.post('/verify-backup', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const parseResult = verifyBackupCodeSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid backup code format',
        details: parseResult.error.issues 
      });
    }

    const { code } = parseResult.data;

    const isValid = await mfaService.verifyBackupCode(userId, code);

    if (!isValid) {
      SecurityAuditLog.log({
        type: 'AUTH_FAILURE',
        userId,
        ip: req.ip,
        details: 'Failed backup code attempt',
        severity: 'MEDIUM',
      });
      return res.status(401).json({ error: 'Invalid backup code' });
    }

    SecurityAuditLog.log({
      type: 'AUTH_FAILURE',
      userId,
      ip: req.ip,
      details: 'Successful backup code login',
      severity: 'LOW',
    });

    res.json({ success: true, message: 'Backup code verified successfully' });
  } catch (error) {
    console.error('Error verifying backup code:', error);
    res.status(500).json({ error: 'Failed to verify backup code' });
  }
});

/**
 * POST /api/auth/mfa/regenerate-backup-codes
 * Regenerate backup codes
 */
router.post('/regenerate-backup-codes', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;

    // Verify MFA is enabled
    const enabled = await mfaService.isMFAEnabled(userId);
    if (!enabled) {
      return res.status(400).json({ error: 'MFA is not enabled' });
    }

    const backupCodes = await mfaService.regenerateBackupCodes(userId);

    SecurityAuditLog.log({
      type: 'AUTH_FAILURE',
      userId,
      ip: req.ip,
      details: 'Backup codes regenerated',
      severity: 'LOW',
    });

    res.json({ backupCodes });
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
});

/**
 * POST /api/auth/mfa/disable
 * Disable MFA (requires token verification)
 */
router.post('/disable', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).claims.sub;
    const parseResult = verifyTokenSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid token format - must verify with current token to disable',
        details: parseResult.error.issues 
      });
    }

    const { token } = parseResult.data;

    // Verify current token before disabling
    const isValid = await mfaService.verifyMFAToken(userId, token);

    if (!isValid) {
      SecurityAuditLog.log({
        type: 'AUTH_FAILURE',
        userId,
        ip: req.ip,
        details: 'Failed MFA disable attempt (invalid token)',
        severity: 'MEDIUM',
      });
      return res.status(401).json({ error: 'Invalid authentication code' });
    }

    await mfaService.disableMFA(userId);

    SecurityAuditLog.log({
      type: 'PRIVILEGE_ESCALATION',
      userId,
      ip: req.ip,
      details: 'MFA disabled',
      severity: 'MEDIUM',
    });

    // Send MFA disabled email
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user?.email) {
      const userName = user.firstName 
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.email.split('@')[0];
      
      await emailService.sendMfaDisabled(user.email, {
        userName,
        timestamp: new Date(),
        ipAddress: req.ip || 'Unknown',
      });
    }

    res.json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('Error disabling MFA:', error);
    res.status(500).json({ error: 'Failed to disable MFA' });
  }
});

export default router;

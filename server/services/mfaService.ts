import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts sensitive data (MFA secrets)
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts sensitive data (MFA secrets)
 */
function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hashes backup codes for secure storage
 */
function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Generates a new MFA secret and QR code for user setup
 */
export async function setupMFA(userId: string, email: string) {
  // Generate TOTP secret
  const secret = speakeasy.generateSecret({
    name: `WriteCraft (${email})`,
    issuer: 'WriteCraft',
    length: 32,
  });

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Hash backup codes before storing
  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  // Encrypt the secret before storing
  const encryptedSecret = encrypt(secret.base32);

  // Store in database (not enabled yet, user must verify first)
  await db.update(users)
    .set({
      mfaSecret: encryptedSecret,
      backupCodes: hashedBackupCodes,
      mfaEnabled: false, // Not enabled until first successful verification
    })
    .where(eq(users.id, userId));

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode: qrCodeDataUrl,
    backupCodes, // Return plain text codes for user to save
  };
}

/**
 * Verifies a TOTP token against the user's secret
 */
export async function verifyMFAToken(userId: string, token: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.mfaSecret) {
    return false;
  }

  // Decrypt the secret
  const secret = decrypt(user.mfaSecret);

  // Verify the token with a 30-second window
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // Allow 1 step (30 seconds) before and after current time
  });

  return verified;
}

/**
 * Verifies a backup code
 */
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.backupCodes || user.backupCodes.length === 0) {
    return false;
  }

  const hashedCode = hashBackupCode(code);
  const codeIndex = user.backupCodes.indexOf(hashedCode);

  if (codeIndex === -1) {
    return false;
  }

  // Remove the used backup code
  const updatedBackupCodes = user.backupCodes.filter((_, index) => index !== codeIndex);

  await db.update(users)
    .set({ backupCodes: updatedBackupCodes })
    .where(eq(users.id, userId));

  return true;
}

/**
 * Enables MFA after successful first verification
 */
export async function enableMFA(userId: string): Promise<void> {
  await db.update(users)
    .set({ mfaEnabled: true })
    .where(eq(users.id, userId));
}

/**
 * Disables MFA and removes secrets
 */
export async function disableMFA(userId: string): Promise<void> {
  await db.update(users)
    .set({
      mfaEnabled: false,
      mfaSecret: null,
      backupCodes: null,
    })
    .where(eq(users.id, userId));
}

/**
 * Checks if user has MFA enabled
 */
export async function isMFAEnabled(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { mfaEnabled: true },
  });

  return user?.mfaEnabled || false;
}

/**
 * Regenerates backup codes
 */
export async function regenerateBackupCodes(userId: string) {
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  await db.update(users)
    .set({ backupCodes: hashedBackupCodes })
    .where(eq(users.id, userId));

  return backupCodes;
}

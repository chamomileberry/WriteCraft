import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// CRITICAL: MFA_ENCRYPTION_KEY must be set in environment variables
// This ensures stable encryption/decryption across server restarts
const envKey = process.env.MFA_ENCRYPTION_KEY;

if (!envKey || envKey.length < 64) {
  throw new Error(
    'MFA_ENCRYPTION_KEY environment variable must be set and at least 64 characters (32 bytes hex). ' +
    'Generate with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
  );
}

// TypeScript now knows this is defined (validated above)
const ENCRYPTION_KEY: string = envKey;

const ALGORITHM = 'aes-256-gcm';
const BCRYPT_ROUNDS = 10; // Industry standard for bcrypt

/**
 * Encrypts sensitive data using AES-256-GCM (authenticated encryption)
 * GCM mode provides both confidentiality and authenticity
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag (GCM mode)
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return iv.toString('hex') + ':' + authTag + ':' + encrypted;
}

/**
 * Decrypts sensitive data using AES-256-GCM
 * Verifies authentication tag to ensure data integrity
 */
function decrypt(text: string): string {
  const parts = text.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  // Set the authentication tag for verification
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hashes backup codes using bcrypt for secure storage
 * bcrypt is designed to be slow, making brute force attacks impractical
 */
async function hashBackupCode(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_ROUNDS);
}

/**
 * Verifies a backup code against its bcrypt hash
 */
async function verifyBackupCodeHash(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
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

  // Generate backup codes (10 codes, 8 characters each)
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Hash backup codes with bcrypt before storing
  const hashedBackupCodes = await Promise.all(
    backupCodes.map(code => hashBackupCode(code))
  );

  // Encrypt the secret before storing using AES-256-GCM
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
    backupCodes, // Return plain text codes for user to save (only shown once)
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

  try {
    // Decrypt the secret using AES-256-GCM
    const secret = decrypt(user.mfaSecret);

    // Verify the token with a 30-second window
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 step (30 seconds) before and after current time
    });

    return verified;
  } catch (error) {
    console.error('[MFA] Failed to verify token:', error);
    return false;
  }
}

/**
 * Verifies a backup code using bcrypt
 */
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.backupCodes || user.backupCodes.length === 0) {
    return false;
  }

  // Check each hashed backup code
  for (let i = 0; i < user.backupCodes.length; i++) {
    const isValid = await verifyBackupCodeHash(code, user.backupCodes[i]);
    
    if (isValid) {
      // Remove the used backup code
      const updatedBackupCodes = user.backupCodes.filter((_, index) => index !== i);

      await db.update(users)
        .set({ backupCodes: updatedBackupCodes })
        .where(eq(users.id, userId));

      return true;
    }
  }

  return false;
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
 * Regenerates backup codes using bcrypt
 */
export async function regenerateBackupCodes(userId: string) {
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  const hashedBackupCodes = await Promise.all(
    backupCodes.map(code => hashBackupCode(code))
  );

  await db.update(users)
    .set({ backupCodes: hashedBackupCodes })
    .where(eq(users.id, userId));

  return backupCodes;
}

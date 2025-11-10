/**
 * Encryption Service
 * AES-256-GCM encryption for API keys
 */

import crypto from 'crypto';

// Get encryption key from environment (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn('⚠️  API_KEY_ENCRYPTION_KEY not set. API key encryption will not work!');
  console.warn('Generate one with: openssl rand -hex 32');
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM mode
const AUTH_TAG_LENGTH = 16;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encryption Service for API keys
 */
export class EncryptionService {
  /**
   * Encrypt a string using AES-256-GCM
   */
  static encrypt(text: string): EncryptedData {
    if (!ENCRYPTION_KEY) {
      throw new Error('API_KEY_ENCRYPTION_KEY environment variable is not set');
    }

    // Validate key length (must be 32 bytes = 64 hex characters)
    if (ENCRYPTION_KEY.length !== 64) {
      throw new Error(
        'API_KEY_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate with: openssl rand -hex 32'
      );
    }

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt a string using AES-256-GCM
   */
  static decrypt(encryptedData: EncryptedData): string {
    if (!ENCRYPTION_KEY) {
      throw new Error('API_KEY_ENCRYPTION_KEY environment variable is not set');
    }

    const { encrypted, iv, authTag } = encryptedData;

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );

    // Set authentication tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash data using SHA-256 (for cache keys)
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a secure random key (for initialization)
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate API key format
   */
  static validateApiKeyFormat(apiKey: string): boolean {
    // Basic validation: non-empty, reasonable length, no placeholder text
    return (
      apiKey.length >= 20 &&
      !apiKey.includes('your_') &&
      !apiKey.includes('xxx') &&
      !apiKey.includes('***')
    );
  }

  /**
   * Get key preview (last 4 characters)
   */
  static getKeyPreview(apiKey: string): string {
    if (apiKey.length < 4) {
      return '****';
    }
    return apiKey.slice(-4);
  }
}

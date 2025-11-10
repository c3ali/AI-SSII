/**
 * API Key Service
 * Manages encrypted API keys for LLM providers per user
 */

import { PrismaClient } from '@prisma/client';
import { EncryptionService, EncryptedData } from './encryption.service';

const prisma = new PrismaClient();

/**
 * Service for managing user API keys
 */
export class ApiKeyService {
  /**
   * Store or update an API key for a user and provider
   */
  static async storeApiKey(
    userId: string,
    provider: string,
    apiKey: string
  ): Promise<void> {
    // Validate API key format
    if (!EncryptionService.validateApiKeyFormat(apiKey)) {
      throw new Error('Invalid API key format');
    }

    // Encrypt the API key
    const encryptedData = EncryptionService.encrypt(apiKey);

    // Store encrypted parts as JSON
    const keyHash = JSON.stringify(encryptedData);

    // Get key preview
    const keyPreview = EncryptionService.getKeyPreview(apiKey);

    // Upsert the API key
    await prisma.apiKey.upsert({
      where: {
        userId_provider: { userId, provider }
      },
      update: {
        keyHash,
        keyPreview,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        provider,
        keyHash,
        keyPreview,
        isActive: true
      }
    });
  }

  /**
   * Get decrypted API key for a user and provider
   */
  static async getApiKey(
    userId: string,
    provider: string
  ): Promise<string | null> {
    const record = await prisma.apiKey.findUnique({
      where: {
        userId_provider: { userId, provider }
      }
    });

    if (!record || !record.isActive) {
      return null;
    }

    try {
      const encryptedData: EncryptedData = JSON.parse(record.keyHash);
      return EncryptionService.decrypt(encryptedData);
    } catch (error) {
      console.error(`Failed to decrypt API key for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Get all API keys for a user (decrypted)
   */
  static async getAllApiKeys(userId: string): Promise<Record<string, string>> {
    const records = await prisma.apiKey.findMany({
      where: { userId, isActive: true }
    });

    const apiKeys: Record<string, string> = {};

    for (const record of records) {
      try {
        const encryptedData: EncryptedData = JSON.parse(record.keyHash);
        const decrypted = EncryptionService.decrypt(encryptedData);
        apiKeys[record.provider] = decrypted;
      } catch (error) {
        console.error(`Failed to decrypt API key for ${record.provider}:`, error);
      }
    }

    return apiKeys;
  }

  /**
   * Get API key previews (last 4 chars) for display
   */
  static async getApiKeyPreviews(
    userId: string
  ): Promise<Array<{ provider: string; preview: string; lastUsed?: Date }>> {
    const records = await prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: {
        provider: true,
        keyPreview: true,
        lastUsedAt: true
      }
    });

    return records.map(record => ({
      provider: record.provider,
      preview: `***${record.keyPreview}`,
      lastUsed: record.lastUsedAt || undefined
    }));
  }

  /**
   * Check if user has an API key for a provider
   */
  static async hasApiKey(userId: string, provider: string): Promise<boolean> {
    const count = await prisma.apiKey.count({
      where: {
        userId,
        provider,
        isActive: true
      }
    });

    return count > 0;
  }

  /**
   * Delete an API key
   */
  static async deleteApiKey(userId: string, provider: string): Promise<void> {
    await prisma.apiKey.delete({
      where: {
        userId_provider: { userId, provider }
      }
    });
  }

  /**
   * Deactivate an API key (soft delete)
   */
  static async deactivateApiKey(
    userId: string,
    provider: string
  ): Promise<void> {
    await prisma.apiKey.update({
      where: {
        userId_provider: { userId, provider }
      },
      data: {
        isActive: false
      }
    });
  }

  /**
   * Mark API key as used (update lastUsedAt)
   */
  static async markAsUsed(userId: string, provider: string): Promise<void> {
    await prisma.apiKey.update({
      where: {
        userId_provider: { userId, provider }
      },
      data: {
        lastUsedAt: new Date()
      }
    });
  }

  /**
   * Get all providers with API keys for a user
   */
  static async getConfiguredProviders(
    userId: string
  ): Promise<string[]> {
    const records = await prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: { provider: true }
    });

    return records.map(r => r.provider);
  }

  /**
   * Cleanup: Remove inactive API keys older than specified days
   */
  static async cleanupInactiveKeys(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.apiKey.deleteMany({
      where: {
        isActive: false,
        updatedAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }
}

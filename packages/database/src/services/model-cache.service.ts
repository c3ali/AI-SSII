/**
 * Model Cache Service
 * Manages caching of dynamic models from LLM providers
 */

import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './encryption.service';

const prisma = new PrismaClient();

export interface CachedModel {
  name: string;
  label: string;
  provider: string;
  maxTokenAllowed: number;
  maxCompletionTokens?: number;
  pricing?: {
    input: number;
    output: number;
  };
  features?: {
    streaming?: boolean;
    functionCalling?: boolean;
    vision?: boolean;
  };
}

/**
 * Service for caching models from LLM providers
 */
export class ModelCacheService {
  /**
   * Generate cache key from API key and settings
   * Uses hash to avoid storing sensitive data
   */
  static generateCacheKey(apiKey?: string, settings?: any): string {
    const data = JSON.stringify({
      apiKey: apiKey ? `***${apiKey.slice(-4)}` : undefined,
      settings
    });
    return EncryptionService.hash(data);
  }

  /**
   * Get cached models for a provider
   */
  static async getCachedModels(
    provider: string,
    apiKey?: string,
    settings?: any
  ): Promise<CachedModel[] | null> {
    const cacheKey = this.generateCacheKey(apiKey, settings);

    const cache = await prisma.modelCache.findUnique({
      where: {
        provider_cacheKey: { provider, cacheKey }
      }
    });

    // Check if cache exists and is not expired
    if (!cache || cache.expiresAt < new Date()) {
      return null;
    }

    return cache.models as CachedModel[];
  }

  /**
   * Store models in cache
   */
  static async storeCachedModels(
    provider: string,
    models: CachedModel[],
    apiKey?: string,
    settings?: any,
    ttlMinutes: number = 60
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(apiKey, settings);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await prisma.modelCache.upsert({
      where: {
        provider_cacheKey: { provider, cacheKey }
      },
      update: {
        models: models as any,
        expiresAt
      },
      create: {
        provider,
        cacheKey,
        models: models as any,
        expiresAt
      }
    });
  }

  /**
   * Clear expired cache entries
   * Should be run periodically (e.g., via cron job)
   */
  static async clearExpiredCache(): Promise<number> {
    const result = await prisma.modelCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return result.count;
  }

  /**
   * Clear all cache for a specific provider
   */
  static async clearProviderCache(provider: string): Promise<number> {
    const result = await prisma.modelCache.deleteMany({
      where: { provider }
    });

    return result.count;
  }

  /**
   * Clear all cache
   */
  static async clearAllCache(): Promise<number> {
    const result = await prisma.modelCache.deleteMany();
    return result.count;
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    providerBreakdown: Record<string, number>;
  }> {
    const allEntries = await prisma.modelCache.findMany({
      select: {
        provider: true,
        expiresAt: true
      }
    });

    const now = new Date();
    const expiredEntries = allEntries.filter(e => e.expiresAt < now).length;

    const providerBreakdown: Record<string, number> = {};
    for (const entry of allEntries) {
      providerBreakdown[entry.provider] =
        (providerBreakdown[entry.provider] || 0) + 1;
    }

    return {
      totalEntries: allEntries.length,
      expiredEntries,
      providerBreakdown
    };
  }

  /**
   * Get cache entry age
   */
  static async getCacheAge(
    provider: string,
    apiKey?: string,
    settings?: any
  ): Promise<number | null> {
    const cacheKey = this.generateCacheKey(apiKey, settings);

    const cache = await prisma.modelCache.findUnique({
      where: {
        provider_cacheKey: { provider, cacheKey }
      },
      select: {
        createdAt: true
      }
    });

    if (!cache) {
      return null;
    }

    return Date.now() - cache.createdAt.getTime();
  }

  /**
   * Check if cache is valid (exists and not expired)
   */
  static async isCacheValid(
    provider: string,
    apiKey?: string,
    settings?: any
  ): Promise<boolean> {
    const models = await this.getCachedModels(provider, apiKey, settings);
    return models !== null;
  }
}

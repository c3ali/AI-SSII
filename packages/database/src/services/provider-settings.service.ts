/**
 * Provider Settings Service
 * Manages user-specific provider configurations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProviderConfig {
  enabled: boolean;
  baseUrl?: string;
  [key: string]: any;
}

/**
 * Service for managing provider settings per user
 */
export class ProviderSettingsService {
  /**
   * Get settings for a specific provider
   */
  static async getSettings(
    userId: string,
    provider: string
  ): Promise<ProviderConfig | null> {
    const record = await prisma.providerSetting.findUnique({
      where: {
        userId_provider: { userId, provider }
      }
    });

    if (!record) {
      return null;
    }

    return {
      enabled: record.enabled,
      baseUrl: record.baseUrl || undefined,
      ...(record.settings as object || {})
    };
  }

  /**
   * Get all provider settings for a user
   */
  static async getAllSettings(
    userId: string
  ): Promise<Record<string, ProviderConfig>> {
    const records = await prisma.providerSetting.findMany({
      where: { userId }
    });

    const settings: Record<string, ProviderConfig> = {};

    for (const record of records) {
      settings[record.provider] = {
        enabled: record.enabled,
        baseUrl: record.baseUrl || undefined,
        ...(record.settings as object || {})
      };
    }

    return settings;
  }

  /**
   * Update or create provider settings
   */
  static async updateSettings(
    userId: string,
    provider: string,
    updates: {
      enabled?: boolean;
      baseUrl?: string;
      settings?: Record<string, any>;
    }
  ): Promise<void> {
    await prisma.providerSetting.upsert({
      where: {
        userId_provider: { userId, provider }
      },
      update: {
        ...updates,
        updatedAt: new Date()
      },
      create: {
        userId,
        provider,
        enabled: updates.enabled ?? false,
        baseUrl: updates.baseUrl,
        settings: updates.settings || {}
      }
    });
  }

  /**
   * Enable a provider
   */
  static async enableProvider(userId: string, provider: string): Promise<void> {
    await this.updateSettings(userId, provider, { enabled: true });
  }

  /**
   * Disable a provider
   */
  static async disableProvider(userId: string, provider: string): Promise<void> {
    await this.updateSettings(userId, provider, { enabled: false });
  }

  /**
   * Get all enabled providers for a user
   */
  static async getEnabledProviders(userId: string): Promise<string[]> {
    const records = await prisma.providerSetting.findMany({
      where: {
        userId,
        enabled: true
      },
      select: { provider: true }
    });

    return records.map(r => r.provider);
  }

  /**
   * Check if a provider is enabled
   */
  static async isProviderEnabled(
    userId: string,
    provider: string
  ): Promise<boolean> {
    const record = await prisma.providerSetting.findUnique({
      where: {
        userId_provider: { userId, provider }
      },
      select: { enabled: true }
    });

    return record?.enabled ?? false;
  }

  /**
   * Delete provider settings
   */
  static async deleteSettings(userId: string, provider: string): Promise<void> {
    await prisma.providerSetting.delete({
      where: {
        userId_provider: { userId, provider }
      }
    });
  }

  /**
   * Initialize default settings for a user
   * Typically called when user is created
   */
  static async initializeDefaults(
    userId: string,
    defaultProviders: string[] = ['OpenAI', 'Anthropic']
  ): Promise<void> {
    const promises = defaultProviders.map(provider =>
      prisma.providerSetting.upsert({
        where: {
          userId_provider: { userId, provider }
        },
        update: {},
        create: {
          userId,
          provider,
          enabled: false, // User must enable explicitly
          settings: {}
        }
      })
    );

    await Promise.all(promises);
  }

  /**
   * Bulk update provider settings
   */
  static async bulkUpdateSettings(
    userId: string,
    providerSettings: Record<string, Partial<ProviderConfig>>
  ): Promise<void> {
    const promises = Object.entries(providerSettings).map(([provider, settings]) =>
      this.updateSettings(userId, provider, {
        enabled: settings.enabled,
        baseUrl: settings.baseUrl,
        settings: { ...settings }
      })
    );

    await Promise.all(promises);
  }
}

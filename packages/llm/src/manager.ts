/**
 * LLM Manager
 * Singleton class that orchestrates all LLM providers
 */

import { BaseProvider } from './base-provider';
import { ModelInfo, IProviderSetting, GetProviderOptions } from './types';
import { LanguageModelV1 } from 'ai';

/**
 * Singleton manager for all LLM providers
 */
export class LLMManager {
  private static instance: LLMManager;
  private providers: Map<string, BaseProvider> = new Map();
  public env?: Record<string, any>; // Global environment variables

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  static getInstance(): LLMManager {
    if (!LLMManager.instance) {
      LLMManager.instance = new LLMManager();
    }
    return LLMManager.instance;
  }

  /**
   * Register a provider
   */
  registerProvider(provider: BaseProvider): void {
    if (this.providers.has(provider.name)) {
      console.warn(`Provider ${provider.name} is already registered. Overwriting.`);
    }
    this.providers.set(provider.name, provider);
    console.log(`✓ Registered provider: ${provider.name}`);
  }

  /**
   * Get a specific provider by name
   */
  getProvider(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is registered
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Get enabled providers based on settings
   */
  getEnabledProviders(providerSettings?: Record<string, IProviderSetting>): string[] {
    if (!providerSettings) {
      // If no settings, return all providers with API keys in env
      return this.getAllProviders()
        .filter(provider => provider.hasApiKey({ serverEnv: process.env }))
        .map(provider => provider.name);
    }

    return Object.entries(providerSettings)
      .filter(([_, settings]) => settings.enabled)
      .map(([providerName]) => providerName);
  }

  /**
   * Get all available models from all enabled providers
   */
  async getAllModels(
    apiKeys?: Record<string, string>,
    providerSettings?: Record<string, IProviderSetting>,
    serverEnv?: any
  ): Promise<ModelInfo[]> {
    const enabledProviders = this.getEnabledProviders(providerSettings);

    const modelPromises = enabledProviders.map(async (providerName) => {
      const provider = this.providers.get(providerName);
      if (!provider) {
        return [];
      }

      const settings = providerSettings?.[providerName];

      try {
        return await provider.getAllModels({ apiKeys, settings, serverEnv });
      } catch (error) {
        console.error(`Failed to fetch models for ${providerName}:`, error);
        return provider.staticModels; // Fallback to static models
      }
    });

    const allModels = (await Promise.all(modelPromises)).flat();

    // Deduplicate by model name (keep first occurrence)
    const uniqueModels = Array.from(
      new Map(allModels.map(model => [model.name, model])).values()
    );

    // Sort by provider, then by label
    return uniqueModels.sort((a, b) => {
      const providerCompare = a.provider.localeCompare(b.provider);
      if (providerCompare !== 0) return providerCompare;
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Get models for a specific provider
   */
  async getModelsForProvider(
    providerName: string,
    apiKeys?: Record<string, string>,
    providerSettings?: Record<string, IProviderSetting>,
    serverEnv?: any
  ): Promise<ModelInfo[]> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const settings = providerSettings?.[providerName];
    return await provider.getAllModels({ apiKeys, settings, serverEnv });
  }

  /**
   * Get model instance for execution
   */
  getModelInstance(
    providerName: string,
    model: string,
    apiKeys?: Record<string, string>,
    providerSettings?: Record<string, IProviderSetting>,
    serverEnv?: any
  ): LanguageModelV1 {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const settings = providerSettings?.[providerName];

    return provider.getModelInstance({
      model,
      serverEnv,
      apiKeys,
      settings
    });
  }

  /**
   * Get default provider (first one with API key configured)
   */
  getDefaultProvider(
    apiKeys?: Record<string, string>,
    providerSettings?: Record<string, IProviderSetting>
  ): string | null {
    // Check enabled providers first
    const enabledProviders = this.getEnabledProviders(providerSettings);

    for (const providerName of enabledProviders) {
      const provider = this.providers.get(providerName);
      if (provider?.hasApiKey({ apiKeys, serverEnv: process.env })) {
        return providerName;
      }
    }

    // Fallback: first provider with API key
    for (const provider of this.providers.values()) {
      if (provider.hasApiKey({ apiKeys, serverEnv: process.env })) {
        return provider.name;
      }
    }

    return null;
  }

  /**
   * Check if a provider is configured (has API key)
   */
  isProviderConfigured(
    providerName: string,
    apiKeys?: Record<string, string>,
    serverEnv?: any
  ): boolean {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return false;
    }

    return provider.hasApiKey({ apiKeys, serverEnv });
  }

  /**
   * Get configured providers
   */
  getConfiguredProviders(
    apiKeys?: Record<string, string>,
    serverEnv?: any
  ): Array<{ name: string; hasApiKey: boolean }> {
    return this.getAllProviders().map(provider => ({
      name: provider.name,
      hasApiKey: provider.hasApiKey({ apiKeys, serverEnv })
    }));
  }

  /**
   * Clear all provider caches
   */
  clearAllCaches(): void {
    for (const provider of this.providers.values()) {
      provider.clearCache();
    }
    console.log('✓ Cleared all provider caches');
  }

  /**
   * Clear cache for specific provider
   */
  clearProviderCache(providerName: string): void {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.clearCache();
      console.log(`✓ Cleared cache for ${providerName}`);
    }
  }

  /**
   * Get statistics about registered providers
   */
  getStats(): {
    totalProviders: number;
    configuredProviders: number;
    totalStaticModels: number;
  } {
    const providers = this.getAllProviders();

    return {
      totalProviders: providers.length,
      configuredProviders: providers.filter(p =>
        p.hasApiKey({ serverEnv: process.env })
      ).length,
      totalStaticModels: providers.reduce(
        (sum, p) => sum + p.staticModels.length,
        0
      )
    };
  }

  /**
   * Initialize manager with environment variables
   */
  initialize(env?: Record<string, any>): void {
    this.env = env;
    console.log('✓ LLM Manager initialized');
  }
}

/**
 * Export singleton instance getter
 */
export const getLLMManager = () => LLMManager.getInstance();

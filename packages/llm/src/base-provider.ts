/**
 * Base Provider Abstract Class
 * All LLM providers extend this class to ensure consistent interface
 */

import {
  ProviderInfo,
  ProviderConfig,
  IProviderSetting,
  ModelInfo,
  GetProviderOptions,
  ProviderCredentials
} from './types';
import { LanguageModelV1 } from 'ai';

/**
 * Abstract base class for all LLM providers
 */
export abstract class BaseProvider implements ProviderInfo {
  abstract name: string;
  abstract staticModels: ModelInfo[];
  abstract config: ProviderConfig;

  // Optional properties for UI display
  icon?: string;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;

  // In-memory cache for dynamic models
  private modelCache: Map<string, { models: ModelInfo[]; expiresAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Get provider base URL and API key from multiple sources
   * Priority: settings > server env > process env > defaults
   */
  getProviderBaseUrlAndKey(options: GetProviderOptions): ProviderCredentials {
    const { apiKeys, serverEnv, settings } = options;
    const { apiTokenKey, baseUrlKey, baseUrl: defaultBaseUrl } = this.config;

    // Get base URL from settings first, then env vars, then default
    let baseUrl: string | undefined;
    if (baseUrlKey) {
      baseUrl =
        settings?.[baseUrlKey] ||
        serverEnv?.[baseUrlKey] ||
        process.env[baseUrlKey] ||
        defaultBaseUrl;
    } else {
      baseUrl = defaultBaseUrl;
    }

    // Get API key from apiKeys map, then env vars
    let apiKey: string | undefined;
    if (apiTokenKey) {
      apiKey =
        apiKeys?.[this.name] ||
        serverEnv?.[apiTokenKey] ||
        process.env[apiTokenKey];
    }

    // Normalize base URL (remove trailing slash)
    if (baseUrl) {
      baseUrl = baseUrl.replace(/\/$/, '');
    }

    return { baseUrl, apiKey };
  }

  /**
   * Generate cache key for dynamic models
   * Based on API key and settings to ensure proper caching
   */
  getDynamicModelsCacheKey(options: GetProviderOptions): string {
    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey(options);
    return JSON.stringify({
      provider: this.name,
      baseUrl,
      apiKey: apiKey ? `***${apiKey.slice(-4)}` : undefined
    });
  }

  /**
   * Get cached dynamic models if available and not expired
   */
  getModelsFromCache(cacheKey: string): ModelInfo[] | null {
    const cached = this.modelCache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() > cached.expiresAt) {
      this.modelCache.delete(cacheKey);
      return null;
    }

    return cached.models;
  }

  /**
   * Store dynamic models in cache with TTL
   */
  storeDynamicModels(models: ModelInfo[], cacheKey: string): void {
    this.modelCache.set(cacheKey, {
      models,
      expiresAt: Date.now() + this.CACHE_TTL_MS
    });
  }

  /**
   * Clear all cached models for this provider
   */
  clearCache(): void {
    this.modelCache.clear();
  }

  /**
   * Get all models (static + dynamic with caching)
   */
  async getAllModels(options: GetProviderOptions = {}): Promise<ModelInfo[]> {
    // Always include static models
    const staticModels = this.staticModels;

    // If no dynamic model fetching, return static only
    if (!this.getDynamicModels) {
      return staticModels;
    }

    // Check cache first
    const cacheKey = this.getDynamicModelsCacheKey(options);
    const cachedDynamic = this.getModelsFromCache(cacheKey);

    if (cachedDynamic) {
      return [...staticModels, ...cachedDynamic];
    }

    // Fetch dynamic models
    try {
      const { apiKeys, settings, serverEnv } = options;
      const dynamicModels = await this.getDynamicModels(apiKeys, settings, serverEnv);

      // Filter out duplicates (models that are already in static)
      const uniqueDynamic = dynamicModels.filter(
        dm => !staticModels.some(sm => sm.name === dm.name)
      );

      // Store in cache
      this.storeDynamicModels(uniqueDynamic, cacheKey);

      return [...staticModels, ...uniqueDynamic];
    } catch (error) {
      console.error(`Error fetching dynamic models for ${this.name}:`, error);
      return staticModels; // Fallback to static models on error
    }
  }

  /**
   * Optional: Fetch dynamic models from provider API
   * Override this in child classes if provider supports dynamic model listing
   */
  getDynamicModels?(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: any
  ): Promise<ModelInfo[]>;

  /**
   * Required: Get model instance for execution
   * Must be implemented by each provider
   */
  abstract getModelInstance(options: {
    model: string;
    serverEnv?: any;
    apiKeys?: Record<string, string>;
    settings?: IProviderSetting;
  }): LanguageModelV1;

  /**
   * Helper: Generate human-readable label from model ID
   */
  protected generateLabel(modelId: string): string {
    return modelId
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: Calculate cost based on usage and pricing
   */
  protected calculateCost(
    promptTokens: number,
    completionTokens: number,
    pricing?: { input: number; output: number }
  ): number | undefined {
    if (!pricing) {
      return undefined;
    }

    const inputCost = (promptTokens / 1_000_000) * pricing.input;
    const outputCost = (completionTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Helper: Check if API key is configured
   */
  hasApiKey(options: GetProviderOptions): boolean {
    const { apiKey } = this.getProviderBaseUrlAndKey(options);
    return !!apiKey && apiKey.length > 0;
  }

  /**
   * Helper: Validate API key format (basic check)
   */
  validateApiKeyFormat(apiKey: string): boolean {
    // Basic validation: non-empty and reasonable length
    return apiKey.length >= 20 && !apiKey.includes('your_') && !apiKey.includes('xxx');
  }
}

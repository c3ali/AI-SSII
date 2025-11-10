/**
 * Multi-Provider LLM System Types
 * Inspired by bolt.diy architecture, adapted for SSII IA Platform
 */

import { LanguageModelV1 } from 'ai';

/**
 * Information about a specific model
 */
export interface ModelInfo {
  name: string;
  label: string;
  provider: string;
  maxTokenAllowed: number;
  maxCompletionTokens?: number;
  pricing?: {
    input: number;  // Price per 1M tokens
    output: number; // Price per 1M tokens
  };
  features?: {
    streaming?: boolean;
    functionCalling?: boolean;
    vision?: boolean;
  };
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiTokenKey?: string;  // Environment variable name for API key
  baseUrlKey?: string;   // Environment variable name for base URL
  baseUrl?: string;      // Default base URL
}

/**
 * Provider settings per user
 */
export interface IProviderSetting {
  enabled?: boolean;
  baseUrl?: string;
  [key: string]: any;
}

/**
 * Provider information and capabilities
 */
export interface ProviderInfo {
  name: string;
  staticModels: ModelInfo[];
  config: ProviderConfig;

  // Optional dynamic model fetching
  getDynamicModels?: (
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: any
  ) => Promise<ModelInfo[]>;

  // Get instance of the model
  getModelInstance: (options: {
    model: string;
    serverEnv?: any;
    apiKeys?: Record<string, string>;
    settings?: IProviderSetting;
  }) => LanguageModelV1;

  // UI display information
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
  icon?: string;
}

/**
 * Options for getting provider credentials
 */
export interface GetProviderOptions {
  apiKeys?: Record<string, string>;
  serverEnv?: any;
  settings?: IProviderSetting;
}

/**
 * Provider credentials result
 */
export interface ProviderCredentials {
  baseUrl?: string;
  apiKey?: string;
}

/**
 * Model cache entry
 */
export interface ModelCacheEntry {
  provider: string;
  cacheKey: string;
  models: ModelInfo[];
  expiresAt: Date;
}

/**
 * LLM execution options
 */
export interface LLMExecutionOptions {
  model: string;
  provider: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

/**
 * LLM execution result
 */
export interface LLMExecutionResult {
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  cost?: number; // Calculated cost in USD
}

/**
 * Supported agent types in SSII platform
 */
export enum AgentType {
  DIRECTOR = 'DIRECTOR',
  ARCHITECT = 'ARCHITECT',
  DEVELOPER = 'DEVELOPER',
  SECURITY = 'SECURITY',
  QA = 'QA',
  DEVOPS = 'DEVOPS'
}

/**
 * Agent-specific LLM configuration
 */
export interface AgentLLMConfig {
  agent: AgentType;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

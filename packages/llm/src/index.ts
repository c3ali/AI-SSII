/**
 * Multi-Provider LLM System
 * Main export file for @ssii/llm package
 */

// Core classes
export { BaseProvider } from './base-provider';
export { LLMManager, getLLMManager } from './manager';

// Types
export * from './types';

// Providers
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';
export { GoogleProvider } from './providers/google';
export { GroqProvider } from './providers/groq';
export { MistralProvider } from './providers/mistral';
export { DeepSeekProvider } from './providers/deepseek';

// Auto-register all providers
import { LLMManager } from './manager';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { GroqProvider } from './providers/groq';
import { MistralProvider } from './providers/mistral';
import { DeepSeekProvider } from './providers/deepseek';

/**
 * Initialize and register all providers
 * Call this once at application startup
 */
export function initializeLLM(env?: Record<string, any>): void {
  const manager = LLMManager.getInstance();

  // Initialize with environment
  if (env) {
    manager.initialize(env);
  }

  // Register all providers
  manager.registerProvider(new OpenAIProvider());
  manager.registerProvider(new AnthropicProvider());
  manager.registerProvider(new GoogleProvider());
  manager.registerProvider(new GroqProvider());
  manager.registerProvider(new MistralProvider());
  manager.registerProvider(new DeepSeekProvider());

  console.log('✅ LLM System initialized with', manager.getStats().totalProviders, 'providers');
}

/**
 * Get quick access to manager instance
 */
export const llm = () => LLMManager.getInstance();

/**
 * Anthropic Provider
 * Supports Claude 3.5 Sonnet, Claude 3 Opus, Haiku, and other Anthropic models
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { BaseProvider } from '../base-provider';
import { ModelInfo, ProviderConfig, IProviderSetting } from '../types';
import { LanguageModelV1 } from 'ai';

export class AnthropicProvider extends BaseProvider {
  name = 'Anthropic';

  config: ProviderConfig = {
    apiTokenKey: 'ANTHROPIC_API_KEY'
  };

  icon = 'https://www.anthropic.com/favicon.ico';
  getApiKeyLink = 'https://console.anthropic.com/settings/keys';
  labelForGetApiKey = 'Get Anthropic API Key';

  staticModels: ModelInfo[] = [
    {
      name: 'claude-3-5-sonnet-20241022',
      label: 'Claude 3.5 Sonnet',
      provider: this.name,
      maxTokenAllowed: 200000,
      maxCompletionTokens: 8192,
      pricing: {
        input: 3.00,
        output: 15.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'claude-3-5-haiku-20241022',
      label: 'Claude 3.5 Haiku',
      provider: this.name,
      maxTokenAllowed: 200000,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.80,
        output: 4.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'claude-3-opus-20240229',
      label: 'Claude 3 Opus',
      provider: this.name,
      maxTokenAllowed: 200000,
      maxCompletionTokens: 4096,
      pricing: {
        input: 15.00,
        output: 75.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'claude-3-sonnet-20240229',
      label: 'Claude 3 Sonnet',
      provider: this.name,
      maxTokenAllowed: 200000,
      maxCompletionTokens: 4096,
      pricing: {
        input: 3.00,
        output: 15.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'claude-3-haiku-20240307',
      label: 'Claude 3 Haiku',
      provider: this.name,
      maxTokenAllowed: 200000,
      maxCompletionTokens: 4096,
      pricing: {
        input: 0.25,
        output: 1.25
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    }
  ];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: any
  ): Promise<ModelInfo[]> {
    const { apiKey } = this.getProviderBaseUrlAndKey({ apiKeys, serverEnv, settings });

    if (!apiKey) {
      return [];
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Anthropic API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();

      // Filter out models already in static list
      return data.data
        .filter((model: any) =>
          !this.staticModels.some(sm => sm.name === model.id)
        )
        .map((model: any) => ({
          name: model.id,
          label: this.generateLabel(model.id),
          provider: this.name,
          maxTokenAllowed: model.context_window || 200000,
          maxCompletionTokens: model.max_output_tokens || 4096
        }));
    } catch (error) {
      console.error('Error fetching Anthropic models:', error);
      return [];
    }
  }

  getModelInstance(options: {
    model: string;
    serverEnv?: any;
    apiKeys?: Record<string, string>;
    settings?: IProviderSetting;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, settings } = options;
    const { apiKey } = this.getProviderBaseUrlAndKey({ apiKeys, serverEnv, settings });

    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const anthropic = createAnthropic({ apiKey });

    return anthropic(model, {
      cacheControl: true
    });
  }
}

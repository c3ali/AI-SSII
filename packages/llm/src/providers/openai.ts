/**
 * OpenAI Provider
 * Supports GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, and other OpenAI models
 */

import { createOpenAI } from '@ai-sdk/openai';
import { BaseProvider } from '../base-provider';
import { ModelInfo, ProviderConfig, IProviderSetting } from '../types';
import { LanguageModelV1 } from 'ai';

export class OpenAIProvider extends BaseProvider {
  name = 'OpenAI';

  config: ProviderConfig = {
    apiTokenKey: 'OPENAI_API_KEY'
  };

  icon = 'https://openai.com/favicon.ico';
  getApiKeyLink = 'https://platform.openai.com/api-keys';
  labelForGetApiKey = 'Get OpenAI API Key';

  staticModels: ModelInfo[] = [
    {
      name: 'gpt-4o',
      label: 'GPT-4o',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 16384,
      pricing: {
        input: 2.50,
        output: 10.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'gpt-4o-mini',
      label: 'GPT-4o Mini',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 16384,
      pricing: {
        input: 0.15,
        output: 0.60
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
      pricing: {
        input: 10.00,
        output: 30.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'gpt-4',
      label: 'GPT-4',
      provider: this.name,
      maxTokenAllowed: 8192,
      maxCompletionTokens: 8192,
      pricing: {
        input: 30.00,
        output: 60.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo',
      provider: this.name,
      maxTokenAllowed: 16385,
      maxCompletionTokens: 4096,
      pricing: {
        input: 0.50,
        output: 1.50
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'o1-preview',
      label: 'O1 Preview',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 32768,
      pricing: {
        input: 15.00,
        output: 60.00
      },
      features: {
        streaming: false,
        functionCalling: false,
        vision: true
      }
    },
    {
      name: 'o1-mini',
      label: 'O1 Mini',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 65536,
      pricing: {
        input: 3.00,
        output: 12.00
      },
      features: {
        streaming: false,
        functionCalling: false,
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
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();

      // Filter for GPT models and exclude already defined static models
      return data.data
        .filter((model: any) => {
          const isGPT = model.id.startsWith('gpt-') || model.id.startsWith('o1-');
          const notInStatic = !this.staticModels.some(sm => sm.name === model.id);
          return isGPT && notInStatic;
        })
        .map((model: any) => ({
          name: model.id,
          label: this.generateLabel(model.id),
          provider: this.name,
          maxTokenAllowed: 8192, // Default for unknown models
          maxCompletionTokens: 4096
        }));
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
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
      throw new Error('OpenAI API key is required');
    }

    const openai = createOpenAI({ apiKey });
    return openai(model);
  }
}

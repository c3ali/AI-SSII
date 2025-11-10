/**
 * Mistral Provider
 * Supports Mistral Large, Medium, and Small models
 */

import { createMistral } from '@ai-sdk/mistral';
import { BaseProvider } from '../base-provider';
import { ModelInfo, ProviderConfig, IProviderSetting } from '../types';
import { LanguageModelV1 } from 'ai';

export class MistralProvider extends BaseProvider {
  name = 'Mistral';

  config: ProviderConfig = {
    apiTokenKey: 'MISTRAL_API_KEY'
  };

  icon = 'https://mistral.ai/favicon.ico';
  getApiKeyLink = 'https://console.mistral.ai/api-keys';
  labelForGetApiKey = 'Get Mistral API Key';

  staticModels: ModelInfo[] = [
    {
      name: 'mistral-large-latest',
      label: 'Mistral Large',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
      pricing: {
        input: 2.00,
        output: 6.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'mistral-small-latest',
      label: 'Mistral Small',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.20,
        output: 0.60
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'mistral-medium-latest',
      label: 'Mistral Medium',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.70,
        output: 2.10
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'pixtral-large-latest',
      label: 'Pixtral Large',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
      pricing: {
        input: 2.00,
        output: 6.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'codestral-latest',
      label: 'Codestral',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.20,
        output: 0.60
      },
      features: {
        streaming: true,
        functionCalling: false,
        vision: false
      }
    }
  ];

  getModelInstance(options: {
    model: string;
    serverEnv?: any;
    apiKeys?: Record<string, string>;
    settings?: IProviderSetting;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, settings } = options;
    const { apiKey } = this.getProviderBaseUrlAndKey({ apiKeys, serverEnv, settings });

    if (!apiKey) {
      throw new Error('Mistral API key is required');
    }

    const mistral = createMistral({ apiKey });
    return mistral(model);
  }
}

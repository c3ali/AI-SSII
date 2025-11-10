/**
 * DeepSeek Provider
 * Chinese AI company with competitive pricing
 */

import { createOpenAI } from '@ai-sdk/openai';
import { BaseProvider } from '../base-provider';
import { ModelInfo, ProviderConfig, IProviderSetting } from '../types';
import { LanguageModelV1 } from 'ai';

export class DeepSeekProvider extends BaseProvider {
  name = 'DeepSeek';

  config: ProviderConfig = {
    apiTokenKey: 'DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com'
  };

  icon = 'https://www.deepseek.com/favicon.ico';
  getApiKeyLink = 'https://platform.deepseek.com/api_keys';
  labelForGetApiKey = 'Get DeepSeek API Key';

  staticModels: ModelInfo[] = [
    {
      name: 'deepseek-chat',
      label: 'DeepSeek Chat',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 4096,
      pricing: {
        input: 0.14,
        output: 0.28
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'deepseek-coder',
      label: 'DeepSeek Coder',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 4096,
      pricing: {
        input: 0.14,
        output: 0.28
      },
      features: {
        streaming: true,
        functionCalling: true,
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
    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey({
      apiKeys,
      serverEnv,
      settings
    });

    if (!apiKey) {
      throw new Error('DeepSeek API key is required');
    }

    const deepseek = createOpenAI({
      apiKey,
      baseURL: baseUrl
    });

    return deepseek(model);
  }
}

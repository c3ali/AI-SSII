/**
 * Groq Provider
 * Fast inference with Llama, Mixtral, and other open-source models
 */

import { createOpenAI } from '@ai-sdk/openai';
import { BaseProvider } from '../base-provider';
import { ModelInfo, ProviderConfig, IProviderSetting } from '../types';
import { LanguageModelV1 } from 'ai';

export class GroqProvider extends BaseProvider {
  name = 'Groq';

  config: ProviderConfig = {
    apiTokenKey: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai/v1'
  };

  icon = 'https://groq.com/favicon.ico';
  getApiKeyLink = 'https://console.groq.com/keys';
  labelForGetApiKey = 'Get Groq API Key';

  staticModels: ModelInfo[] = [
    {
      name: 'llama-3.3-70b-versatile',
      label: 'Llama 3.3 70B',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 32768,
      pricing: {
        input: 0.59,
        output: 0.79
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'llama-3.1-70b-versatile',
      label: 'Llama 3.1 70B',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.59,
        output: 0.79
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'llama-3.1-8b-instant',
      label: 'Llama 3.1 8B',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.05,
        output: 0.08
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'mixtral-8x7b-32768',
      label: 'Mixtral 8x7B',
      provider: this.name,
      maxTokenAllowed: 32768,
      maxCompletionTokens: 32768,
      pricing: {
        input: 0.24,
        output: 0.24
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      name: 'gemma2-9b-it',
      label: 'Gemma 2 9B',
      provider: this.name,
      maxTokenAllowed: 8192,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.20,
        output: 0.20
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
    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey({
      apiKeys,
      serverEnv,
      settings
    });

    if (!apiKey) {
      throw new Error('Groq API key is required');
    }

    const groq = createOpenAI({
      apiKey,
      baseURL: baseUrl
    });

    return groq(model);
  }
}

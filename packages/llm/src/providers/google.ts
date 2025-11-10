/**
 * Google Provider
 * Supports Gemini models
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { BaseProvider } from '../base-provider';
import { ModelInfo, ProviderConfig, IProviderSetting } from '../types';
import { LanguageModelV1 } from 'ai';

export class GoogleProvider extends BaseProvider {
  name = 'Google';

  config: ProviderConfig = {
    apiTokenKey: 'GOOGLE_GENERATIVE_AI_API_KEY'
  };

  icon = 'https://www.google.com/favicon.ico';
  getApiKeyLink = 'https://aistudio.google.com/app/apikey';
  labelForGetApiKey = 'Get Google API Key';

  staticModels: ModelInfo[] = [
    {
      name: 'gemini-2.0-flash-exp',
      label: 'Gemini 2.0 Flash (Experimental)',
      provider: this.name,
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.00,  // Free during preview
        output: 0.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'gemini-1.5-pro-latest',
      label: 'Gemini 1.5 Pro',
      provider: this.name,
      maxTokenAllowed: 2097152,
      maxCompletionTokens: 8192,
      pricing: {
        input: 1.25,
        output: 5.00
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'gemini-1.5-flash-latest',
      label: 'Gemini 1.5 Flash',
      provider: this.name,
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.075,
        output: 0.30
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'gemini-1.5-flash-8b',
      label: 'Gemini 1.5 Flash 8B',
      provider: this.name,
      maxTokenAllowed: 1048576,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.0375,
        output: 0.15
      },
      features: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      name: 'gemini-1.0-pro',
      label: 'Gemini 1.0 Pro',
      provider: this.name,
      maxTokenAllowed: 32760,
      maxCompletionTokens: 8192,
      pricing: {
        input: 0.50,
        output: 1.50
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
    const { apiKey } = this.getProviderBaseUrlAndKey({ apiKeys, serverEnv, settings });

    if (!apiKey) {
      throw new Error('Google API key is required');
    }

    const google = createGoogleGenerativeAI({ apiKey });
    return google(model);
  }
}

# @ssii/llm - Multi-Provider LLM System

Multi-provider Large Language Model system for SSII IA Platform, inspired by bolt.diy architecture.

## Features

- 🔌 **6+ LLM Providers**: OpenAI, Anthropic, Google, Groq, Mistral, DeepSeek
- 🎯 **Unified Interface**: Single API for all providers
- 🔄 **Dynamic Model Discovery**: Auto-fetch available models from provider APIs
- 💾 **Intelligent Caching**: In-memory cache with TTL for model lists
- 🔐 **Secure**: Environment variable and database-backed API key management
- 📊 **Token Tracking**: Detailed usage and cost tracking
- ⚡ **Type-Safe**: Full TypeScript support

## Installation

```bash
npm install @ssii/llm
```

## Quick Start

### 1. Initialize the System

```typescript
import { initializeLLM, getLLMManager } from '@ssii/llm';

// Initialize with environment variables
initializeLLM(process.env);

const manager = getLLMManager();
```

### 2. Get Available Models

```typescript
// Get all models from all enabled providers
const models = await manager.getAllModels();

// Get models from specific provider
const openaiModels = await manager.getModelsForProvider('OpenAI');
```

### 3. Execute LLM Request

```typescript
import { generateText } from 'ai';

// Get model instance
const model = manager.getModelInstance(
  'OpenAI',  // provider
  'gpt-4o',  // model
  { OpenAI: process.env.OPENAI_API_KEY }  // API keys
);

// Generate text
const result = await generateText({
  model,
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ]
});

console.log(result.text);
console.log('Tokens:', result.usage);
```

## Supported Providers

### OpenAI
- GPT-4o, GPT-4o Mini
- GPT-4 Turbo, GPT-4
- GPT-3.5 Turbo
- O1 Preview, O1 Mini

### Anthropic
- Claude 3.5 Sonnet
- Claude 3.5 Haiku
- Claude 3 Opus
- Claude 3 Sonnet, Haiku

### Google
- Gemini 2.0 Flash
- Gemini 1.5 Pro
- Gemini 1.5 Flash
- Gemini 1.0 Pro

### Groq
- Llama 3.3 70B
- Llama 3.1 70B, 8B
- Mixtral 8x7B
- Gemma 2 9B

### Mistral
- Mistral Large
- Mistral Medium
- Mistral Small
- Pixtral Large
- Codestral

### DeepSeek
- DeepSeek Chat
- DeepSeek Coder

## Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google
GOOGLE_GENERATIVE_AI_API_KEY=...

# Groq
GROQ_API_KEY=gsk_...

# Mistral
MISTRAL_API_KEY=...

# DeepSeek
DEEPSEEK_API_KEY=sk-...
```

## Advanced Usage

### Custom Provider Settings

```typescript
const settings = {
  OpenAI: {
    enabled: true,
    baseUrl: 'https://api.openai.com/v1'
  },
  Groq: {
    enabled: true,
    baseUrl: 'https://api.groq.com/openai/v1'
  }
};

const models = await manager.getAllModels(apiKeys, settings);
```

### Check Provider Configuration

```typescript
const isConfigured = manager.isProviderConfigured('OpenAI', apiKeys);

const configured = manager.getConfiguredProviders(apiKeys);
console.log(configured);
// [{ name: 'OpenAI', hasApiKey: true }, ...]
```

### Cache Management

```typescript
// Clear all provider caches
manager.clearAllCaches();

// Clear specific provider cache
manager.clearProviderCache('OpenAI');
```

### Get Statistics

```typescript
const stats = manager.getStats();
console.log(stats);
// {
//   totalProviders: 6,
//   configuredProviders: 2,
//   totalStaticModels: 35
// }
```

## Creating Custom Providers

```typescript
import { BaseProvider, ModelInfo } from '@ssii/llm';
import { createOpenAI } from '@ai-sdk/openai';

export class CustomProvider extends BaseProvider {
  name = 'CustomProvider';

  config = {
    apiTokenKey: 'CUSTOM_API_KEY',
    baseUrl: 'https://api.custom.com'
  };

  staticModels: ModelInfo[] = [
    {
      name: 'custom-model',
      label: 'Custom Model',
      provider: this.name,
      maxTokenAllowed: 8192,
      maxCompletionTokens: 4096,
      pricing: {
        input: 1.00,
        output: 2.00
      }
    }
  ];

  getModelInstance(options) {
    const { apiKey, baseUrl } = this.getProviderBaseUrlAndKey(options);

    if (!apiKey) {
      throw new Error('API key required');
    }

    const client = createOpenAI({ apiKey, baseURL: baseUrl });
    return client(options.model);
  }
}

// Register the provider
const manager = getLLMManager();
manager.registerProvider(new CustomProvider());
```

## Model Information

Each model includes:

- `name`: Model identifier (e.g., 'gpt-4o')
- `label`: Human-readable name
- `provider`: Provider name
- `maxTokenAllowed`: Context window size
- `maxCompletionTokens`: Max output tokens
- `pricing`: Input/output pricing per 1M tokens
- `features`: Supported features (streaming, function calling, vision)

## Integration with SSII Agents

```typescript
import { AgentType } from '@ssii/llm';

// Configure different models for different agents
const agentConfigs = {
  [AgentType.DIRECTOR]: {
    provider: 'Anthropic',
    model: 'claude-3-5-sonnet-20241022'
  },
  [AgentType.DEVELOPER]: {
    provider: 'OpenAI',
    model: 'gpt-4o'
  },
  [AgentType.SECURITY]: {
    provider: 'OpenAI',
    model: 'gpt-4-turbo'
  }
};
```

## License

MIT

---

Built with inspiration from [bolt.diy](https://github.com/stackblitz-labs/bolt.diy)

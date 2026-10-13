export const CONFIG = {
  STORAGE_KEY: 'onluyen_solve_cfg',
  CACHE_KEY: 'onluyen_solve_cache',
  RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  PROXY_TIMEOUT_MS: 60000,
  INSTANT_MODE: false,
  HUMAN_DELAY_MIN: 200,
  HUMAN_DELAY_MAX: 800,
  LOG_LEVEL: 'INFO',
  DEFAULT_PROVIDER: 'groq',
};

export const PROVIDER_REGISTRY = {
  // ═══════════════ MIỄN PHÍ ═══════════════
  groq: {
    name: 'Groq',
    category: 'free',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.3-70b-specdec',
      'llama-3.1-8b-instant',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'meta-llama/llama-4-maverick-17b-128e-instruct',
      'gemma2-9b-it',
      'qwen/qwen3-32b',
      'deepseek-r1-distill-llama-70b',
    ],
  },

  gemini: {
    name: 'Google Gemini',
    category: 'free',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}',
    authType: 'query',
    defaultModel: 'gemini-2.0-flash',
    models: [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
    ],
    isGemini: true,
  },

  cerebras: {
    name: 'Cerebras',
    category: 'free',
    baseUrl: 'https://api.cerebras.ai/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'llama-3.3-70b',
    models: [
      'llama-3.3-70b',
      'llama-3.1-8b',
      'llama-4-scout-17b-16e-instruct',
      'qwen-3-32b',
    ],
  },

  openrouter: {
    name: 'OpenRouter',
    category: 'free',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'meta-llama/llama-4-scout:free',
      'meta-llama/llama-4-maverick:free',
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-2.5-flash:free',
      'deepseek/deepseek-chat:free',
      'deepseek/deepseek-r1:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'microsoft/phi-4:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
    ],
  },

  // ═══════════════ TRẢ PHÍ ═══════════════
  openai: {
    name: 'OpenAI',
    category: 'paid',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'gpt-4o-mini',
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'o1-mini',
      'o3-mini',
      'o4-mini',
    ],
  },

  anthropic: {
    name: 'Anthropic Claude',
    category: 'paid',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    authType: 'x-api-key',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ],
    isAnthropic: true,
  },

  deepseek: {
    name: 'DeepSeek',
    category: 'paid',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'deepseek-chat',
    models: [
      'deepseek-chat',
      'deepseek-reasoner',
    ],
  },

  // ═══════════════ CUSTOM ═══════════════
  custom: {
    name: 'Custom (OpenAI-compatible)',
    category: 'custom',
    baseUrl: '',
    authType: 'bearer',
    defaultModel: '',
    models: [],
  },
};

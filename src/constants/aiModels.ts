import type { AIProvider } from '@/types/ai'

export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: 'Gemini',
  openrouter: 'OpenRouter',
}

export const AI_MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  openrouter: [
    'openrouter/free',
    'google/gemini-2.5-flash',
    'anthropic/claude-sonnet-4',
    'openai/gpt-4.1-mini',
  ],
}

export function getDefaultModelForProvider(provider: AIProvider) {
  return AI_MODELS[provider][0]
}

export function getProviderOptions() {
  return (Object.keys(AI_PROVIDER_LABELS) as AIProvider[]).map((provider) => ({
    label: AI_PROVIDER_LABELS[provider],
    value: provider,
  }))
}

export function getModelOptions(provider: AIProvider) {
  return AI_MODELS[provider].map((model) => ({
    label: model,
    value: model,
  }))
}

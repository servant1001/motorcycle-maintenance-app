import { AI_MODELS, getDefaultModelForProvider } from '@/constants/aiModels'
import type { AIProvider } from '@/types/ai'

const PROVIDER_KEY = 'driveone.ai.provider'
const MODEL_KEY = 'driveone.ai.model'

export function getStoredAIProvider(): AIProvider {
  const provider = localStorage.getItem(PROVIDER_KEY)
  return provider === 'openrouter' ? 'openrouter' : 'gemini'
}

export function getStoredAIModel(provider: AIProvider) {
  const model = localStorage.getItem(MODEL_KEY)
  return model && AI_MODELS[provider].includes(model) ? model : getDefaultModelForProvider(provider)
}

export function setStoredAIProvider(provider: AIProvider) {
  localStorage.setItem(PROVIDER_KEY, provider)
}

export function setStoredAIModel(model: string) {
  localStorage.setItem(MODEL_KEY, model)
}

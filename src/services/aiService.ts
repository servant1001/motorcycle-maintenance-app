import type { AIChatRequest, AIChatResponse } from '@/types/ai'

const AI_CHAT_API_URL =
  import.meta.env.VITE_AI_CHAT_API_URL?.trim() ||
  'http://127.0.0.1:8787/api/ai/chat'

export async function sendAIChatMessage(payload: AIChatRequest) {
  const response = await fetch(AI_CHAT_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `AI chat request failed: ${response.status}`)
  }

  return (await response.json()) as AIChatResponse
}

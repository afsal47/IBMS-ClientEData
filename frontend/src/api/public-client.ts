import type {
  PublicClientFormLoadResult,
  SubmitPublicClientPayload,
} from '../types/public-client'

const baseUrl = import.meta.env.VITE_API_URL ?? ''

function parseApiErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message
    if (Array.isArray(message)) {
      return message.map(String).join('. ')
    }
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }
  return `Request failed (${status})`
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${baseUrl}${path}`, init)
  } catch {
    throw new Error('Cannot reach the server. Please try again later.')
  }
}

export async function getPublicClientForm(
  token: string,
): Promise<PublicClientFormLoadResult> {
  const response = await apiFetch(
    `/public/client/${encodeURIComponent(token)}`,
  )
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data, response.status))
  }
  return data as PublicClientFormLoadResult
}

export async function submitPublicClientForm(
  token: string,
  payload: SubmitPublicClientPayload,
): Promise<{ message: string }> {
  const body: Record<string, string> = {}
  for (const [key, value] of Object.entries(payload)) {
    const trimmed = value.trim()
    if (trimmed.length > 0) {
      body[key] = trimmed
    }
  }

  const response = await apiFetch(
    `/public/client/${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data, response.status))
  }
  return data as { message: string }
}

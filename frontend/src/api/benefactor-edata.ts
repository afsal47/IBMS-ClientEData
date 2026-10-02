import type { UpsertBenefactorEdataPayload } from '../types/benefactor-edata'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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

export async function upsertBenefactorEdata(
  payload: UpsertBenefactorEdataPayload,
): Promise<{ uid: number } & Record<string, unknown>> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}/benefactor-edata/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      'Cannot reach the API. Start the backend (npm run start:dev in backend) and ensure SQL Server is running on localhost:1433.',
    )
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data, response.status))
  }

  return data as { uid: number } & Record<string, unknown>
}

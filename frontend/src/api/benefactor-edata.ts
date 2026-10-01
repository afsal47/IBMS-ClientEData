import type { UpsertBenefactorEdataPayload } from '../types/benefactor-edata'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function upsertBenefactorEdata(
  payload: UpsertBenefactorEdataPayload,
): Promise<{ uid: number } & Record<string, unknown>> {
  const response = await fetch(`${baseUrl}/benefactor-edata/upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : `Request failed (${response.status})`
    throw new Error(message)
  }

  return data as { uid: number } & Record<string, unknown>
}

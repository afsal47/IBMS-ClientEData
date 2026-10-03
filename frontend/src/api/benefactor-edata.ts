import type {
  BenefactorEdataListItem,
  BenefactorEdataRecord,
  UpsertBenefactorEdataPayload,
} from '../types/benefactor-edata'

/** Empty string uses same origin (Vite dev proxy → backend). */
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
    throw new Error(
      'Cannot reach the API. Start the backend (npm run start:dev in backend) and ensure SQL Server is running on localhost:1433.',
    )
  }
}

export async function listBenefactorEdata(): Promise<BenefactorEdataListItem[]> {
  const response = await apiFetch('/benefactor-edata/list')
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data, response.status))
  }
  return data as BenefactorEdataListItem[]
}

export async function getBenefactorEdata(
  uid: number,
): Promise<BenefactorEdataRecord> {
  const response = await apiFetch(`/benefactor-edata/${uid}`)
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data, response.status))
  }
  return data as BenefactorEdataRecord
}

export async function upsertBenefactorEdata(
  payload: UpsertBenefactorEdataPayload,
): Promise<BenefactorEdataRecord> {
  const response = await apiFetch('/benefactor-edata/upsert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data, response.status))
  }

  return data as BenefactorEdataRecord
}

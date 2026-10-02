import type {
  BenefactorEdataFormState,
  UpsertBenefactorEdataPayload,
} from '../types/benefactor-edata'

function parseIntField(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const n = Number.parseInt(trimmed, 10)
  return Number.isNaN(n) ? undefined : n
}

function parseOptionalString(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export function formStateToPayload(
  form: BenefactorEdataFormState,
  uid: number | null,
): UpsertBenefactorEdataPayload {
  const payload: UpsertBenefactorEdataPayload = {
    code: form.code.trim(),
    name: form.name.trim(),
    deleted: form.deleted,
  }

  if (uid != null && uid > 0) {
    payload.uid = uid
  }

  const optionalStrings: (keyof BenefactorEdataFormState)[] = [
    'address',
    'contactPerson',
    'phone',
    'email',
    'host',
    'versionBase64',
    'fax',
    'trn',
    'website',
    'legalName',
    'tradingName',
    'tin',
    'tradeLicenseNo',
    'tradeLicenseType',
    'tradeLicenseAuthority',
    'endpointId',
    'endpointScheme',
    'postalCode',
    'scanId',
    'country',
    'state',
    'city',
  ]

  for (const key of optionalStrings) {
    const v = parseOptionalString(form[key] as string)
    if (v !== undefined) {
      ;(payload as Record<string, unknown>)[key] = v
    }
  }

  const intFields: (keyof BenefactorEdataFormState)[] = [
    'company',
    'fYear',
    'userId',
    'insertedBy',
    'benefactorType',
  ]

  for (const key of intFields) {
    const v = parseIntField(form[key] as string)
    if (v !== undefined) {
      ;(payload as Record<string, unknown>)[key] = v
    }
  }

  if (form.insertedOn.trim()) {
    payload.insertedOn = new Date(form.insertedOn).toISOString()
  }

  return payload
}

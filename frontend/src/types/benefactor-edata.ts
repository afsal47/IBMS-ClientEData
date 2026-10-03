export type BenefactorEdataListItem = {
  uid: number
  code: string
  name: string
}

export type BenefactorEdataRecord = {
  uid: number
  code: string
  name: string
  address?: string | null
  city?: string | null
  contactPerson?: string | null
  phone?: string | null
  email?: string | null
  company?: number | null
  fYear?: number | null
  deleted: boolean
  userId?: number | null
  scanId?: string | null
  insertedOn?: string | null
  insertedBy?: number | null
  host?: string | null
  versionBase64?: string | null
  benefactorType?: number | null
  country?: string | null
  fax?: string | null
  trn?: string | null
  website?: string | null
  legalName?: string | null
  tradingName?: string | null
  tin?: string | null
  tradeLicenseNo?: string | null
  tradeLicenseType?: string | null
  tradeLicenseAuthority?: string | null
  endpointId?: string | null
  endpointScheme?: string | null
  state?: string | null
  postalCode?: string | null
}

export type BenefactorEdataFormState = {
  code: string
  name: string
  address: string
  city: string
  contactPerson: string
  phone: string
  email: string
  company: string
  fYear: string
  deleted: boolean
  userId: string
  scanId: string
  insertedOn: string
  insertedBy: string
  host: string
  versionBase64: string
  benefactorType: string
  country: string
  fax: string
  trn: string
  website: string
  legalName: string
  tradingName: string
  tin: string
  tradeLicenseNo: string
  tradeLicenseType: string
  tradeLicenseAuthority: string
  endpointId: string
  endpointScheme: string
  state: string
  postalCode: string
}

export type UpsertBenefactorEdataPayload = {
  uid?: number
  code: string
  name: string
  deleted: boolean
  address?: string
  city?: string
  contactPerson?: string
  phone?: string
  email?: string
  company?: number
  fYear?: number
  userId?: number
  scanId?: string
  insertedOn?: string
  insertedBy?: number
  host?: string
  versionBase64?: string
  benefactorType?: number
  country?: string
  fax?: string
  trn?: string
  website?: string
  legalName?: string
  tradingName?: string
  tin?: string
  tradeLicenseNo?: string
  tradeLicenseType?: string
  tradeLicenseAuthority?: string
  endpointId?: string
  endpointScheme?: string
  state?: string
  postalCode?: string
}

export const emptyBenefactorForm = (): BenefactorEdataFormState => ({
  code: '',
  name: '',
  address: '',
  city: '',
  contactPerson: '',
  phone: '',
  email: '',
  company: '',
  fYear: '',
  deleted: false,
  userId: '',
  scanId: '',
  insertedOn: '',
  insertedBy: '',
  host: '',
  versionBase64: '',
  benefactorType: '',
  country: '',
  fax: '',
  trn: '',
  website: '',
  legalName: '',
  tradingName: '',
  tin: '',
  tradeLicenseNo: '',
  tradeLicenseType: '',
  tradeLicenseAuthority: '',
  endpointId: '',
  endpointScheme: '',
  state: '',
  postalCode: '',
})

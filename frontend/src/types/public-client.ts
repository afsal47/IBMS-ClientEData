export type PublicClientReadOnly = {
  code: string
  name: string
  address: string | null
}

export type PublicClientEditable = {
  country: string
  state: string
  city: string
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
  postalCode: string
}

export type PublicClientFormData = PublicClientReadOnly & PublicClientEditable

export type PublicClientAlreadySubmitted = PublicClientReadOnly & {
  alreadySubmitted: true
  message: string
}

export type PublicClientFormLoadResult =
  | PublicClientFormData
  | PublicClientAlreadySubmitted

export function isAlreadySubmitted(
  data: PublicClientFormLoadResult,
): data is PublicClientAlreadySubmitted {
  return (
    'alreadySubmitted' in data &&
    (data as PublicClientAlreadySubmitted).alreadySubmitted === true
  )
}

export type SubmitPublicClientPayload = PublicClientEditable

export const emptyPublicEditable = (): PublicClientEditable => ({
  country: '',
  state: '',
  city: '',
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
  postalCode: '',
})

export function apiToPublicEditable(
  data: PublicClientFormData,
): PublicClientEditable {
  return {
    country: data.country ?? '',
    state: data.state ?? '',
    city: data.city ?? '',
    fax: data.fax ?? '',
    trn: data.trn ?? '',
    website: data.website ?? '',
    legalName: data.legalName ?? '',
    tradingName: data.tradingName ?? '',
    tin: data.tin ?? '',
    tradeLicenseNo: data.tradeLicenseNo ?? '',
    tradeLicenseType: data.tradeLicenseType ?? '',
    tradeLicenseAuthority: data.tradeLicenseAuthority ?? '',
    endpointId: data.endpointId ?? '',
    endpointScheme: data.endpointScheme ?? '',
    postalCode: data.postalCode ?? '',
  }
}

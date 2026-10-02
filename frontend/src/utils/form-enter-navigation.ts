import type { BenefactorEdataFormState } from '../types/benefactor-edata'

/** Tab order for Enter key: matches on-screen grid (left → right, row by row). */
export const FIELD_ENTER_ORDER: (keyof BenefactorEdataFormState)[] = [
  'code',
  'name',
  'legalName',
  'tradingName',
  'address',
  'country',
  'state',
  'city',
  'postalCode',
  'contactPerson',
  'phone',
  'email',
  'fax',
  'website',
  'trn',
  'tin',
  'tradeLicenseNo',
  'tradeLicenseType',
  'tradeLicenseAuthority',
]

export function focusNextFormField(
  currentKey: keyof BenefactorEdataFormState,
): 'focused' | 'submit' {
  const index = FIELD_ENTER_ORDER.indexOf(currentKey)
  if (index < 0) {
    return 'submit'
  }

  for (let i = index + 1; i < FIELD_ENTER_ORDER.length; i++) {
    const key = FIELD_ENTER_ORDER[i]
    const el = document.getElementById(`field-${String(key)}`)
    if (el instanceof HTMLInputElement) {
      if (el.disabled) {
        continue
      }
      el.focus()
      el.select()
      return 'focused'
    }
  }

  return 'submit'
}

export function advanceFormOnEnter(
  currentKey: keyof BenefactorEdataFormState,
): void {
  if (focusNextFormField(currentKey) === 'submit') {
    const formEl = document.getElementById('benefactor-client-form')
    if (formEl instanceof HTMLFormElement) {
      formEl.requestSubmit()
    }
  }
}

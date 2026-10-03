import type {
  BenefactorEdataFormState,
  BenefactorEdataRecord,
} from '../types/benefactor-edata'
import { emptyBenefactorForm } from '../types/benefactor-edata'
import {
  normalizeCountryCode,
  normalizeStateCode,
} from './location-codes'

function str(value: unknown): string {
  if (value == null) return ''
  return String(value)
}

function intStr(value: unknown): string {
  if (value == null || value === '') return ''
  return String(value)
}

export function recordToFormState(
  record: BenefactorEdataRecord,
): BenefactorEdataFormState {
  const form = emptyBenefactorForm()

  form.code = str(record.code)
  form.name = str(record.name)
  form.address = str(record.address)
  form.contactPerson = str(record.contactPerson)
  form.phone = str(record.phone)
  form.email = str(record.email)
  form.company = intStr(record.company)
  form.fYear = intStr(record.fYear)
  form.deleted = Boolean(record.deleted)
  form.userId = intStr(record.userId)
  form.scanId = str(record.scanId)
  form.insertedOn = record.insertedOn
    ? new Date(record.insertedOn).toISOString().slice(0, 16)
    : ''
  form.insertedBy = intStr(record.insertedBy)
  form.host = str(record.host)
  form.versionBase64 = str(record.versionBase64)
  form.benefactorType = intStr(record.benefactorType)
  form.fax = str(record.fax)
  form.trn = str(record.trn)
  form.website = str(record.website)
  form.legalName = str(record.legalName)
  form.tradingName = str(record.tradingName)
  form.tin = str(record.tin)
  form.tradeLicenseNo = str(record.tradeLicenseNo)
  form.tradeLicenseType = str(record.tradeLicenseType)
  form.tradeLicenseAuthority = str(record.tradeLicenseAuthority)
  form.endpointId = str(record.endpointId)
  form.endpointScheme = str(record.endpointScheme)
  form.postalCode = str(record.postalCode)
  form.city = str(record.city)

  const countryCode = normalizeCountryCode(str(record.country))
  form.country = countryCode
  form.state = normalizeStateCode(countryCode, str(record.state))

  return form
}

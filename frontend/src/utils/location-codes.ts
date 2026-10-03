import { Country, State } from 'country-state-city'

/** Resolve DB value to ISO country code (handles legacy full names). */
export function normalizeCountryCode(stored: string): string {
  const trimmed = stored.trim()
  if (!trimmed) return ''

  const byCode = Country.getCountryByCode(trimmed.toUpperCase())
  if (byCode) return byCode.isoCode

  const byName = Country.getAllCountries().find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (byName) return byName.isoCode

  return trimmed
}

/** Resolve DB value to state ISO code within a country (handles legacy names). */
export function normalizeStateCode(
  countryCode: string,
  stored: string,
): string {
  const trimmed = stored.trim()
  if (!trimmed || !countryCode) return ''

  const byCode = State.getStateByCodeAndCountry(
    trimmed.toUpperCase(),
    countryCode,
  )
  if (byCode) return byCode.isoCode

  const states = State.getStatesOfCountry(countryCode)
  const byName = states.find(
    (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (byName) return byName.isoCode

  return trimmed
}

export function countryDisplayName(countryCode: string): string {
  if (!countryCode.trim()) return ''
  const c = Country.getCountryByCode(countryCode.trim().toUpperCase())
  return c?.name ?? countryCode
}

export function stateDisplayName(
  countryCode: string,
  stateCode: string,
): string {
  if (!countryCode.trim() || !stateCode.trim()) return ''
  const s = State.getStateByCodeAndCountry(
    stateCode.trim().toUpperCase(),
    countryCode.trim().toUpperCase(),
  )
  return s?.name ?? stateCode
}

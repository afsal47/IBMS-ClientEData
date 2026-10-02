import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { City, Country, State } from 'country-state-city'

type AddressLocationFieldsProps = {
  country: string
  state: string
  city: string
  onCountryChange: (name: string) => void
  onStateChange: (name: string) => void
  onCityChange: (name: string) => void
}

function optionLabel(code: string, name: string): string {
  return `${code} — ${name}`
}

export function AddressLocationFields({
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
}: AddressLocationFieldsProps) {
  const [countryCode, setCountryCode] = useState('')
  const [stateCode, setStateCode] = useState('')

  const countries = useMemo(
    () =>
      Country.getAllCountries().sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      ),
    [],
  )

  const states = useMemo(
    () =>
      countryCode
        ? State.getStatesOfCountry(countryCode).sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
          )
        : [],
    [countryCode],
  )

  const cities = useMemo(
    () =>
      countryCode && stateCode
        ? City.getCitiesOfState(countryCode, stateCode).sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
          )
        : [],
    [countryCode, stateCode],
  )

  useEffect(() => {
    if (!country) {
      setCountryCode('')
      setStateCode('')
    }
  }, [country])

  useEffect(() => {
    if (!state) {
      setStateCode('')
    }
  }, [state])

  function handleCountryChange(e: ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value
    setCountryCode(code)
    setStateCode('')
    onStateChange('')
    onCityChange('')
    const match = countries.find((c) => c.isoCode === code)
    onCountryChange(match?.name ?? '')
  }

  function handleStateChange(e: ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value
    setStateCode(code)
    onCityChange('')
    const match = states.find((s) => s.isoCode === code)
    onStateChange(match?.name ?? '')
  }

  function handleCityChange(e: ChangeEvent<HTMLSelectElement>) {
    onCityChange(e.target.value)
  }

  return (
    <>
      <div className="form-field">
        <label className="form-label" htmlFor="field-country">
          Country
        </label>
        <select
          id="field-country"
          className="form-input form-select"
          value={countryCode}
          onChange={handleCountryChange}
        >
          <option value="">Select country</option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {optionLabel(c.isoCode, c.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="field-state">
          State / region
        </label>
        <select
          id="field-state"
          className="form-input form-select"
          value={stateCode}
          onChange={handleStateChange}
          disabled={!countryCode}
        >
          <option value="">
            {countryCode ? 'Select state / region' : 'Select a country first'}
          </option>
          {states.map((s) => (
            <option key={s.isoCode} value={s.isoCode}>
              {optionLabel(s.isoCode, s.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="field-city">
          City
        </label>
        <select
          id="field-city"
          className="form-input form-select"
          value={city}
          onChange={handleCityChange}
          disabled={!stateCode}
        >
          <option value="">
            {stateCode ? 'Select city' : 'Select a state first'}
          </option>
          {cities.map((c) => (
            <option key={`${c.stateCode}-${c.name}`} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

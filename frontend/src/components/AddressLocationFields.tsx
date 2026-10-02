import { useEffect, useMemo, useState } from 'react'
import { City, Country, State } from 'country-state-city'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from './SearchableSelect'

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

function countrySearchText(isoCode: string, name: string): string {
  return `${isoCode} ${name}`
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

  const countryOptions: SearchableSelectOption[] = useMemo(
    () =>
      countries.map((c) => ({
        value: c.isoCode,
        label: optionLabel(c.isoCode, c.name),
        searchText: countrySearchText(c.isoCode, c.name),
      })),
    [countries],
  )

  const stateOptions: SearchableSelectOption[] = useMemo(
    () =>
      states.map((s) => ({
        value: s.isoCode,
        label: optionLabel(s.isoCode, s.name),
        searchText: countrySearchText(s.isoCode, s.name),
      })),
    [states],
  )

  const cityOptions: SearchableSelectOption[] = useMemo(
    () =>
      cities.map((c) => ({
        value: c.name,
        label: c.name,
        searchText: c.name,
      })),
    [cities],
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

  function clearCountry() {
    setCountryCode('')
    setStateCode('')
    onCountryChange('')
    onStateChange('')
    onCityChange('')
  }

  function selectCountry(option: SearchableSelectOption) {
    setCountryCode(option.value)
    setStateCode('')
    onStateChange('')
    onCityChange('')
    const match = countries.find((c) => c.isoCode === option.value)
    onCountryChange(match?.name ?? '')
  }

  function clearState() {
    setStateCode('')
    onStateChange('')
    onCityChange('')
  }

  function selectState(option: SearchableSelectOption) {
    setStateCode(option.value)
    onCityChange('')
    const match = states.find((s) => s.isoCode === option.value)
    onStateChange(match?.name ?? '')
  }

  function selectCity(option: SearchableSelectOption) {
    onCityChange(option.value)
  }

  return (
    <>
      <SearchableSelect
        id="field-country"
        label="Country"
        placeholder="Type country name or code…"
        selectedLabel={country}
        options={countryOptions}
        maxResults={250}
        enterFieldKey="country"
        onSelect={selectCountry}
        onClear={clearCountry}
      />

      <SearchableSelect
        id="field-state"
        label="State / region"
        disabled={!countryCode}
        placeholder={
          countryCode ? 'Type state name or code…' : 'Select a country first'
        }
        selectedLabel={state}
        options={stateOptions}
        maxResults={300}
        enterFieldKey="state"
        onSelect={selectState}
        onClear={clearState}
      />

      <SearchableSelect
        id="field-city"
        label="City"
        disabled={!stateCode}
        placeholder={stateCode ? 'Type city name…' : 'Select a state first'}
        selectedLabel={city}
        options={cityOptions}
        minSearchLength={1}
        maxResults={120}
        emptyHint="Type at least one letter to search cities"
        enterFieldKey="city"
        onSelect={selectCity}
        onClear={() => onCityChange('')}
      />
    </>
  )
}

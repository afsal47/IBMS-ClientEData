import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { useParams } from 'react-router-dom'
import {
  getPublicClientForm,
  submitPublicClientForm,
} from '../api/public-client'
import {
  apiToPublicEditable,
  emptyPublicEditable,
  isAlreadySubmitted,
  type PublicClientEditable,
} from '../types/public-client'
import { AddressLocationFields } from './AddressLocationFields'
import '../styles/benefactor-sheet.css'

type FieldDef = {
  key: keyof PublicClientEditable
  label: string
  maxLength?: number
  placeholder?: string
  fullWidth?: boolean
}

const TAX_SECTION_FIELDS: FieldDef[] = [
  { key: 'legalName', label: 'Legal name', maxLength: 200, fullWidth: true },
  { key: 'tradingName', label: 'Trading name', maxLength: 200, fullWidth: true },
  { key: 'trn', label: 'TRN', maxLength: 20, placeholder: 'Tax registration number' },
  { key: 'tin', label: 'TIN', maxLength: 50, placeholder: 'Tax identification number' },
  { key: 'tradeLicenseNo', label: 'Trade license no.', maxLength: 100 },
  { key: 'tradeLicenseType', label: 'License type', maxLength: 100 },
  {
    key: 'tradeLicenseAuthority',
    label: 'Issuing authority',
    maxLength: 200,
    fullWidth: true,
  },
]

const ENDPOINT_FIELDS: FieldDef[] = [
  {
    key: 'endpointId',
    label: 'Endpoint ID',
    maxLength: 100,
    placeholder: 'Your e-invoicing endpoint identifier',
  },
  {
    key: 'endpointScheme',
    label: 'Endpoint scheme',
    maxLength: 100,
    placeholder: 'Scheme / format code',
  },
]

const CONTACT_FIELDS: FieldDef[] = [
  { key: 'fax', label: 'Fax', maxLength: 50 },
  { key: 'website', label: 'Website', maxLength: 50, placeholder: 'https://' },
]

function ReadOnlyField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <label className="client-field client-field-readonly">
      <span className="client-field-label">{label}</span>
      <div className="client-field-readonly-value">{value || '—'}</div>
    </label>
  )
}

function EditableField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string
  onChange: (value: string) => void
}) {
  const className = field.fullWidth
    ? 'client-field client-field-full'
    : 'client-field'

  return (
    <label className={className}>
      <span className="client-field-label">{field.label}</span>
      <input
        className="client-field-input"
        type="text"
        value={value}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function PublicClientUpdatePage() {
  const { token } = useParams<{ token: string }>()
  const [loadState, setLoadState] = useState<
    'loading' | 'ready' | 'error' | 'submitted'
  >('loading')
  const [loadError, setLoadError] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [form, setForm] = useState(emptyPublicEditable)
  const [formKey, setFormKey] = useState(0)
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadForm = useCallback(async () => {
    if (!token?.trim()) {
      setLoadState('error')
      setLoadError('This link is invalid.')
      return
    }

    setLoadState('loading')
    setLoadError('')
    try {
      const data = await getPublicClientForm(token)
      if (isAlreadySubmitted(data)) {
        setCode(data.code)
        setName(data.name)
        setSuccessMessage(data.message)
        setLoadState('submitted')
        return
      }
      setCode(data.code)
      setName(data.name)
      setAddress(data.address ?? '')
      setForm(apiToPublicEditable(data))
      setFormKey((k) => k + 1)
      setLoadState('ready')
    } catch (err) {
      setLoadState('error')
      setLoadError(
        err instanceof Error ? err.message : 'Unable to load this form.',
      )
    }
  }, [token])

  useEffect(() => {
    void loadForm()
  }, [loadForm])

  function updateField<K extends keyof PublicClientEditable>(
    key: K,
    value: PublicClientEditable[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus('idle')
    setSubmitError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token?.trim()) return

    setStatus('saving')
    setSubmitError('')
    try {
      const result = await submitPublicClientForm(token, form)
      setSuccessMessage(result.message)
      setLoadState('submitted')
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to submit. Please try again.',
      )
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="client-form-page client-form-page-centered">
        <p className="client-form-records-status">Loading your form…</p>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="client-form-page client-form-page-centered">
        <div className="client-form-error-card" role="alert">
          <h1 className="client-form-title">Link unavailable</h1>
          <p>{loadError}</p>
        </div>
      </div>
    )
  }

  if (loadState === 'submitted') {
    return (
      <div className="client-form-page client-form-page-centered">
        <div className="client-form-success-card" role="status">
          <h1 className="client-form-title">Thank you</h1>
          <p className="client-form-success-lead">{successMessage}</p>
          <p className="client-form-subtitle">
            You may close this window. No further action is required.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="client-form-page">
      <header className="client-form-header">
        <div className="client-form-header-inner">
          <div className="client-form-brand">
            <span className="client-form-logo">IBMS</span>
            <div>
              <h1 className="client-form-title">Tax &amp; e-invoicing details</h1>
              <p className="client-form-subtitle">
                Please complete the fields below for your organization. Code, name,
                and address cannot be changed here.
              </p>
            </div>
          </div>
          <div className="client-form-actions">
            <button
              type="submit"
              form="public-client-form"
              className="client-btn client-btn-primary"
              disabled={status === 'saving'}
            >
              {status === 'saving' ? 'Submitting…' : 'Submit tax details'}
            </button>
          </div>
        </div>
      </header>

      {submitError ? (
        <div
          className="client-form-banner client-form-banner-error"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <div className="client-form-body client-form-body-single">
        <main className="client-form-main">
          <form
            id="public-client-form"
            className="client-form"
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
          >
            <section className="form-section" aria-labelledby="section-readonly">
              <div className="form-section-head">
                <h2 id="section-readonly" className="form-section-title">
                  Your organization
                </h2>
                <p className="form-section-desc">
                  Provided by Ikey Softwares — read only.
                </p>
              </div>
              <div className="form-section-grid">
                <ReadOnlyField label="Code" value={code} />
                <ReadOnlyField label="Name" value={name} />
                <ReadOnlyField label="Address" value={address} />
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-location">
              <div className="form-section-head">
                <h2 id="section-location" className="form-section-title">
                  Location
                </h2>
              </div>
              <div className="form-section-grid">
                <AddressLocationFields
                  key={formKey}
                  countryCode={form.country}
                  stateCode={form.state}
                  city={form.city}
                  onCountryCodeChange={(v) => updateField('country', v)}
                  onStateCodeChange={(v) => updateField('state', v)}
                  onCityChange={(v) => updateField('city', v)}
                />
                <EditableField
                  field={{
                    key: 'postalCode',
                    label: 'Postal code',
                    maxLength: 20,
                    placeholder: 'ZIP / postal code',
                  }}
                  value={form.postalCode}
                  onChange={(v) => updateField('postalCode', v)}
                />
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-contact">
              <div className="form-section-head">
                <h2 id="section-contact" className="form-section-title">
                  Contact
                </h2>
              </div>
              <div className="form-section-grid">
                {CONTACT_FIELDS.map((field) => (
                  <EditableField
                    key={field.key}
                    field={field}
                    value={form[field.key]}
                    onChange={(v) => updateField(field.key, v)}
                  />
                ))}
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-tax">
              <div className="form-section-head">
                <h2 id="section-tax" className="form-section-title">
                  Tax &amp; licensing
                </h2>
              </div>
              <div className="form-section-grid">
                {TAX_SECTION_FIELDS.map((field) => (
                  <EditableField
                    key={field.key}
                    field={field}
                    value={form[field.key]}
                    onChange={(v) => updateField(field.key, v)}
                  />
                ))}
              </div>
            </section>

            <section className="form-section" aria-labelledby="section-endpoint">
              <div className="form-section-head">
                <h2 id="section-endpoint" className="form-section-title">
                  E-invoicing endpoint
                </h2>
              </div>
              <div className="form-section-grid">
                {ENDPOINT_FIELDS.map((field) => (
                  <EditableField
                    key={field.key}
                    field={field}
                    value={form[field.key]}
                    onChange={(v) => updateField(field.key, v)}
                  />
                ))}
              </div>
            </section>
          </form>
        </main>
      </div>

      <footer className="client-form-footer">
        <p>© Ikey Softwares · Secure client e-invoicing update</p>
      </footer>
    </div>
  )
}

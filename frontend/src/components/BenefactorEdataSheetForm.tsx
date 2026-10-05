import { useCallback, useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  getBenefactorEdata,
  listBenefactorEdata,
  sendBenefactorFormLink,
  upsertBenefactorEdata,
} from '../api/benefactor-edata'
import {
  emptyBenefactorForm,
  type BenefactorEdataFormState,
  type BenefactorEdataListItem,
} from '../types/benefactor-edata'
import { recordToFormState } from '../utils/benefactor-record-mapper'
import { formStateToPayload } from '../utils/benefactor-form'
import { advanceFormOnEnter } from '../utils/form-enter-navigation'
import { AddressLocationFields } from './AddressLocationFields'
import { BenefactorRecordsPanel } from './BenefactorRecordsPanel'
import '../styles/benefactor-sheet.css'

type FieldDef = {
  key: keyof BenefactorEdataFormState
  label: string
  type?: 'text' | 'number' | 'email' | 'url'
  required?: boolean
  maxLength?: number
  placeholder?: string
  /** Span both columns in the section grid */
  fullWidth?: boolean
}

type FormSection = {
  id: string
  title: string
  description?: string
  fields: FieldDef[]
}

/**
 * UI-only: not shown to clients. Still stored in form state / sent when set server-side later.
 * Backend upsert DTO unchanged — omitted optional fields are simply not sent.
 */
export const FIELDS_HIDDEN_FROM_UI: (keyof BenefactorEdataFormState)[] = [
  'company',
  'fYear',
  'deleted',
  'userId',
  'scanId',
  'insertedOn',
  'insertedBy',
  'host',
  'versionBase64',
  'benefactorType',
  'endpointId',
  'endpointScheme',
]

const SECTIONS: FormSection[] = [
  {
    id: 'identity',
    title: 'Organization',
    description: 'Primary identifiers and registered names.',
    fields: [
      { key: 'code', label: 'Code', required: true, maxLength: 20, placeholder: 'Unique client code' },
      { key: 'name', label: 'Display name', required: true, maxLength: 150, placeholder: 'Name as shown on documents' },
      { key: 'legalName', label: 'Legal name', maxLength: 200, placeholder: 'Registered legal entity name' },
      { key: 'tradingName', label: 'Trading name', maxLength: 200, placeholder: 'Brand or trading name (if different)' },
    ],
  },
  {
    id: 'location',
    title: 'Address',
    description: 'Select country, then state or region, then city.',
    fields: [
      {
        key: 'address',
        label: 'Street address',
        maxLength: 200,
        fullWidth: true,
        placeholder: 'Building, street, area',
      },
      { key: 'postalCode', label: 'Postal code', maxLength: 20, placeholder: 'ZIP / postal code' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Primary point of contact for this organization.',
    fields: [
      { key: 'contactPerson', label: 'Contact person', maxLength: 100, placeholder: 'Full name' },
      { key: 'phone', label: 'Phone', maxLength: 50, placeholder: '+971 …' },
      { key: 'email', label: 'Email', type: 'email', maxLength: 100, placeholder: 'name@company.com' },
      { key: 'fax', label: 'Fax', maxLength: 50, placeholder: 'Optional' },
      {
        key: 'website',
        label: 'Website',
        type: 'text',
        maxLength: 50,
        fullWidth: true,
        placeholder: 'https://',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Tax & licensing',
    description: 'Registration and trade license details.',
    fields: [
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
    ],
  },
]

const FIELDS_PRESERVE_CASE: (keyof BenefactorEdataFormState)[] = [
  'email',
  'website',
]

function normalizeFieldInput(
  key: keyof BenefactorEdataFormState,
  raw: string,
): string {
  if (FIELDS_PRESERVE_CASE.includes(key)) return raw
  return raw.toUpperCase()
}

function preservesInputCase(key: keyof BenefactorEdataFormState): boolean {
  return FIELDS_PRESERVE_CASE.includes(key)
}

function advanceFocusOnEnter(
  e: KeyboardEvent<HTMLInputElement>,
  key: keyof BenefactorEdataFormState,
) {
  if (e.key !== 'Enter') return

  e.preventDefault()
  advanceFormOnEnter(key)
}

function FieldControl({
  field,
  form,
  updateField,
}: {
  field: FieldDef
  form: BenefactorEdataFormState
  updateField: <K extends keyof BenefactorEdataFormState>(
    key: K,
    value: BenefactorEdataFormState[K],
  ) => void
}) {
  const id = `field-${field.key}`
  return (
    <div
      className={`form-field${field.fullWidth ? ' form-field-full' : ''}`}
    >
      <label className="form-label" htmlFor={id}>
        {field.label}
        {field.required ? <span className="form-required">Required</span> : null}
      </label>
      <input
        id={id}
        className={`form-input${preservesInputCase(field.key) ? '' : ' form-input-upper'}`}
        type={field.type ?? 'text'}
        value={form[field.key] as string}
        maxLength={field.maxLength}
        required={field.required}
        placeholder={field.placeholder}
        autoCapitalize={preservesInputCase(field.key) ? 'off' : 'characters'}
        autoCorrect="off"
        spellCheck={preservesInputCase(field.key)}
        onChange={(e) =>
          updateField(
            field.key,
            normalizeFieldInput(field.key, e.target.value) as never,
          )
        }
        onKeyDown={(e) => advanceFocusOnEnter(e, field.key)}
      />
    </div>
  )
}

export function BenefactorEdataSheetForm() {
  const [form, setForm] = useState(emptyBenefactorForm)
  const [savedUid, setSavedUid] = useState<number | null>(null)
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [records, setRecords] = useState<BenefactorEdataListItem[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [formInstanceKey, setFormInstanceKey] = useState(0)
  const [status, setStatus] = useState<
    'idle' | 'saving' | 'success' | 'error' | 'sending-link'
  >('idle')
  const [isFormCompleted, setIsFormCompleted] = useState(false)
  const [message, setMessage] = useState('')
  const [recordsError, setRecordsError] = useState<string | null>(null)

  const refreshRecords = useCallback(async () => {
    setRecordsLoading(true)
    setRecordsError(null)
    try {
      const rows = await listBenefactorEdata()
      setRecords(rows)
    } catch (err) {
      setRecords([])
      setRecordsError(
        err instanceof Error
          ? err.message
          : 'Could not load saved records from the API.',
      )
    } finally {
      setRecordsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshRecords()
  }, [refreshRecords])

  function resetFormForNewEntry() {
    setForm(emptyBenefactorForm())
    setSavedUid(null)
    setSelectedUid(null)
    setIsFormCompleted(false)
    setFormInstanceKey((k) => k + 1)
  }

  async function handleSelectRecord(uid: number) {
    setStatus('idle')
    setMessage('')
    try {
      const record = await getBenefactorEdata(uid)
      setForm(recordToFormState(record))
      setSavedUid(record.uid)
      setSelectedUid(record.uid)
      setIsFormCompleted(record.isFormCompleted === true)
      setFormInstanceKey((k) => k + 1)
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof Error ? err.message : 'Unable to load record.',
      )
    }
  }

  function updateField<K extends keyof BenefactorEdataFormState>(
    key: K,
    value: BenefactorEdataFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus('idle')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setMessage('')

    if (!form.code.trim() || !form.name.trim()) {
      setStatus('error')
      setMessage('Code and display name are required.')
      return
    }

    let reportingUpdate = savedUid != null && savedUid > 0

    try {
      let payload = formStateToPayload(form, savedUid)
      try {
        await upsertBenefactorEdata(payload)
      } catch (firstErr) {
        const msg =
          firstErr instanceof Error ? firstErr.message : String(firstErr)
        const staleUidUpdate =
          reportingUpdate &&
          (msg.includes('was not found') || msg.includes('(404)'))

        if (!staleUidUpdate) {
          throw firstErr
        }

        setSavedUid(null)
        reportingUpdate = false
        payload = formStateToPayload(form, null)
        await upsertBenefactorEdata(payload)
      }

      setStatus('success')
      setMessage(
        reportingUpdate
          ? `Your information was updated successfully.`
          : `Thank you — your information was saved successfully.`,
      )
      await refreshRecords()
      resetFormForNewEntry()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unable to save. Please try again.')
    }
  }

  function handleNewRecord() {
    resetFormForNewEntry()
    setStatus('idle')
    setMessage('')
  }

  async function handleSendFormLink() {
    if (selectedUid == null) {
      setStatus('error')
      setMessage('Select a saved record before sending the form link.')
      return
    }
    if (!form.email.trim()) {
      setStatus('error')
      setMessage('Add an email address on this record before sending the link.')
      return
    }

    setStatus('sending-link')
    setMessage('')
    try {
      const emailTo = form.email.trim()
      const result = await sendBenefactorFormLink(selectedUid, emailTo)
      setStatus('success')
      setMessage(
        `${result.message} Delivery was requested for ${result.email}.`,
      )
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof Error ? err.message : 'Could not send the form link.',
      )
    }
  }

  return (
    <div className="client-form-page">
      <header className="client-form-header">
        <div className="client-form-header-inner">
          <div className="client-form-brand">
            <span className="client-form-logo">IBMS</span>
            <div>
              <h1 className="client-form-title">Client E-Data</h1>
              <p className="client-form-subtitle">
                Share your organization details securely. Fields marked required must be completed.
              </p>
            </div>
          </div>
          <div className="client-form-actions">
            <button
              type="button"
              className="client-btn client-btn-ghost"
              onClick={handleNewRecord}
            >
              Start over
            </button>
            <button
              type="button"
              className="client-btn client-btn-ghost"
              onClick={() => void handleSendFormLink()}
              disabled={
                status === 'saving' ||
                status === 'sending-link' ||
                selectedUid == null
              }
              title="Email a secure link to the address on this record"
            >
              {status === 'sending-link' ? 'Sending link…' : 'Email form link'}
            </button>
            <button
              type="submit"
              form="benefactor-client-form"
              className="client-btn client-btn-primary"
              disabled={status === 'saving' || status === 'sending-link'}
            >
              {status === 'saving' ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </div>
      </header>

      {message ? (
        <div
          className={`client-form-banner client-form-banner-${status}`}
          role="status"
        >
          {message}
        </div>
      ) : null}

      <div className="client-form-body">
        <main className="client-form-main">
          <form
            id="benefactor-client-form"
            onSubmit={handleSubmit}
            className="client-form"
            noValidate
          >
            {SECTIONS.map((section) => (
            <section key={section.id} className="form-section" aria-labelledby={`section-${section.id}`}>
              <div className="form-section-head">
                <h2 id={`section-${section.id}`} className="form-section-title">
                  {section.title}
                </h2>
                {section.description ? (
                  <p className="form-section-desc">{section.description}</p>
                ) : null}
              </div>
              <div className="form-section-grid">
                {section.id === 'location' ? (
                  <>
                    {section.fields
                      .filter((field) => field.key === 'address')
                      .map((field) => (
                        <FieldControl
                          key={field.key}
                          field={field}
                          form={form}
                          updateField={updateField}
                        />
                      ))}
                    <AddressLocationFields
                      key={formInstanceKey}
                      countryCode={form.country}
                      stateCode={form.state}
                      city={form.city}
                      onCountryCodeChange={(code) =>
                        updateField('country', code)
                      }
                      onStateCodeChange={(code) => updateField('state', code)}
                      onCityChange={(name) => updateField('city', name)}
                    />
                    {section.fields
                      .filter((field) => field.key === 'postalCode')
                      .map((field) => (
                        <FieldControl
                          key={field.key}
                          field={field}
                          form={form}
                          updateField={updateField}
                        />
                      ))}
                  </>
                ) : (
                  section.fields.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      form={form}
                      updateField={updateField}
                    />
                  ))
                )}
              </div>
            </section>
            ))}
          </form>
        </main>

        <BenefactorRecordsPanel
          records={records}
          selectedUid={selectedUid}
          loading={recordsLoading}
          loadError={recordsError}
          onSelect={handleSelectRecord}
          onRetry={() => void refreshRecords()}
        />
      </div>

      <footer className="client-form-footer">
        <p>© IBMS Client E-Data · Your data is transmitted over a secure connection.</p>
      </footer>
    </div>
  )
}

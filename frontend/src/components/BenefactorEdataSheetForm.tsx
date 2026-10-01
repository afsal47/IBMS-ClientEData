import { useState, type FormEvent } from 'react'
import { upsertBenefactorEdata } from '../api/benefactor-edata'
import {
  emptyBenefactorForm,
  type BenefactorEdataFormState,
} from '../types/benefactor-edata'
import { formStateToPayload } from '../utils/benefactor-form'
import '../styles/benefactor-sheet.css'

type FieldDef = {
  key: keyof BenefactorEdataFormState
  label: string
  type?: 'text' | 'number' | 'checkbox' | 'datetime-local'
  required?: boolean
  maxLength?: number
}

const FIELDS: FieldDef[] = [
  { key: 'code', label: 'Code', required: true, maxLength: 20 },
  { key: 'name', label: 'Name', required: true, maxLength: 150 },
  { key: 'address', label: 'Address', maxLength: 200 },
  { key: 'city', label: 'City', type: 'number' },
  { key: 'contactPerson', label: 'Contact Person', maxLength: 100 },
  { key: 'phone', label: 'Phone', maxLength: 50 },
  { key: 'email', label: 'Email', maxLength: 100 },
  { key: 'company', label: 'Company', type: 'number' },
  { key: 'fYear', label: 'F Year', type: 'number' },
  { key: 'deleted', label: 'Deleted (soft delete)', type: 'checkbox' },
  { key: 'userId', label: 'User', type: 'number' },
  { key: 'scanId', label: 'Scan ID (UUID)', maxLength: 36 },
  { key: 'insertedOn', label: 'Inserted On', type: 'datetime-local' },
  { key: 'insertedBy', label: 'Inserted By', type: 'number' },
  { key: 'host', label: 'Host', maxLength: 50 },
  { key: 'versionBase64', label: 'Version (base64)', maxLength: 500 },
  { key: 'benefactorType', label: 'Benefactor Type', type: 'number' },
  { key: 'country', label: 'Country', type: 'number' },
  { key: 'fax', label: 'Fax', maxLength: 50 },
  { key: 'trn', label: 'TRN', maxLength: 20 },
  { key: 'website', label: 'Website', maxLength: 50 },
  { key: 'legalName', label: 'Legal Name', maxLength: 200 },
  { key: 'tradingName', label: 'Trading Name', maxLength: 200 },
  { key: 'tin', label: 'TIN', maxLength: 50 },
  { key: 'tradeLicenseNo', label: 'Trade License No', maxLength: 100 },
  { key: 'tradeLicenseType', label: 'Trade License Type', maxLength: 100 },
  {
    key: 'tradeLicenseAuthority',
    label: 'Trade License Authority',
    maxLength: 200,
  },
  { key: 'endpointId', label: 'Endpoint ID', maxLength: 100 },
  { key: 'endpointScheme', label: 'Endpoint Scheme', maxLength: 100 },
  { key: 'state', label: 'State', type: 'number' },
  { key: 'postalCode', label: 'Postal Code', maxLength: 20 },
]

export function BenefactorEdataSheetForm() {
  const [form, setForm] = useState(emptyBenefactorForm)
  const [savedUid, setSavedUid] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState('')

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
      setMessage('Code and Name are required.')
      return
    }

    try {
      const payload = formStateToPayload(form, savedUid)
      const result = await upsertBenefactorEdata(payload)
      if (typeof result.uid === 'number') {
        setSavedUid(result.uid)
      }
      setStatus('success')
      setMessage(
        savedUid
          ? `Updated record (UID ${result.uid}).`
          : `Created record (UID ${result.uid}). Further saves will update this row.`,
      )
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Save failed.')
    }
  }

  function handleNewRecord() {
    setForm(emptyBenefactorForm())
    setSavedUid(null)
    setStatus('idle')
    setMessage('New row — next save will insert.')
  }

  return (
    <div className="sheet-page">
      <header className="sheet-toolbar">
        <div className="sheet-toolbar-title">Benefactor E-Data</div>
        <div className="sheet-toolbar-actions">
          <button
            type="button"
            className="sheet-btn sheet-btn-secondary"
            onClick={handleNewRecord}
          >
            New row
          </button>
          <button
            type="submit"
            form="benefactor-sheet-form"
            className="sheet-btn sheet-btn-primary"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {message && (
        <div className={`sheet-banner sheet-banner-${status}`} role="status">
          {message}
        </div>
      )}

      <form id="benefactor-sheet-form" onSubmit={handleSubmit}>
        <div className="sheet-grid" role="table" aria-label="Benefactor fields">
          <div className="sheet-row sheet-row-header" role="row">
            <div className="sheet-cell sheet-cell-label" role="columnheader">
              Field
            </div>
            <div className="sheet-cell sheet-cell-value" role="columnheader">
              Value
            </div>
          </div>

          {FIELDS.map((field) => (
            <div className="sheet-row" role="row" key={field.key}>
              <label
                className="sheet-cell sheet-cell-label"
                htmlFor={`field-${field.key}`}
              >
                {field.label}
                {field.required ? ' *' : ''}
              </label>
              <div className="sheet-cell sheet-cell-value">
                {field.type === 'checkbox' ? (
                  <input
                    id={`field-${field.key}`}
                    type="checkbox"
                    checked={form[field.key] as boolean}
                    onChange={(e) =>
                      updateField(field.key, e.target.checked as never)
                    }
                  />
                ) : (
                  <input
                    id={`field-${field.key}`}
                    className="sheet-input"
                    type={field.type ?? 'text'}
                    value={form[field.key] as string}
                    maxLength={field.maxLength}
                    required={field.required}
                    onChange={(e) =>
                      updateField(field.key, e.target.value as never)
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}

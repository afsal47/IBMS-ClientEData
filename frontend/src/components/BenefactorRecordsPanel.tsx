import type { BenefactorEdataListItem } from '../types/benefactor-edata'

type BenefactorRecordsPanelProps = {
  records: BenefactorEdataListItem[]
  selectedUid: number | null
  loading: boolean
  loadError: string | null
  onSelect: (uid: number) => void
  onRetry: () => void
}

export function BenefactorRecordsPanel({
  records,
  selectedUid,
  loading,
  loadError,
  onSelect,
  onRetry,
}: BenefactorRecordsPanelProps) {
  return (
    <aside className="client-form-records-panel" aria-label="Saved organizations">
      <div className="client-form-records-head">
        <h2 className="client-form-records-title">Saved records</h2>
        <p className="client-form-records-desc">
          Select a code to load and edit.
        </p>
      </div>
      {loading ? (
        <p className="client-form-records-status">Loading…</p>
      ) : loadError ? (
        <div className="client-form-records-status client-form-records-error">
          <p>{loadError}</p>
          <button type="button" className="client-btn client-btn-ghost" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : records.length === 0 ? (
        <p className="client-form-records-status">No records in the database yet.</p>
      ) : (
        <ul className="client-form-records-list">
          {records.map((row) => (
            <li key={row.uid}>
              <button
                type="button"
                className={`client-form-records-item${
                  selectedUid === row.uid
                    ? ' client-form-records-item-active'
                    : ''
                }`}
                onClick={() => onSelect(row.uid)}
              >
                <span className="client-form-records-code">{row.code}</span>
                <span className="client-form-records-name">{row.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

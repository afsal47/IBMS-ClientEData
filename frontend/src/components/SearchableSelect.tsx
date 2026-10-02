import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import type { BenefactorEdataFormState } from '../types/benefactor-edata'
import { advanceFormOnEnter } from '../utils/form-enter-navigation'

export type SearchableSelectOption = {
  value: string
  label: string
  searchText: string
}

type SearchableSelectProps = {
  id: string
  label: string
  disabled?: boolean
  placeholder?: string
  selectedLabel: string
  options: SearchableSelectOption[]
  /** When query is shorter than this, the list stays empty (helps large city lists). */
  minSearchLength?: number
  maxResults?: number
  emptyHint?: string
  enterFieldKey: keyof BenefactorEdataFormState
  onSelect: (option: SearchableSelectOption) => void
  onClear: () => void
}

function normalizeForSearch(text: string): string {
  return text.trim().toLowerCase()
}

function optionMatches(query: string, searchText: string): boolean {
  const q = normalizeForSearch(query)
  if (!q) return true
  return searchText.toLowerCase().includes(q)
}

export function SearchableSelect({
  id,
  label,
  disabled = false,
  placeholder = 'Type to search…',
  selectedLabel,
  options,
  minSearchLength = 0,
  maxResults = 200,
  emptyHint,
  enterFieldKey,
  onSelect,
  onClear,
}: SearchableSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(selectedLabel)
  const [highlightIndex, setHighlightIndex] = useState(0)

  useEffect(() => {
    if (!open) {
      setQuery(selectedLabel)
    }
  }, [selectedLabel, open])

  const filtered = useMemo(() => {
    const q = query.trim()
    if (q.length < minSearchLength) {
      return []
    }
    return options
      .filter((opt) => optionMatches(query, opt.searchText))
      .slice(0, maxResults)
  }, [options, query, minSearchLength, maxResults])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query, filtered.length])

  function closeList(revertToSelection = true) {
    setOpen(false)
    if (revertToSelection) {
      setQuery(selectedLabel)
    }
  }

  function pick(option: SearchableSelectOption) {
    onSelect(option)
    setQuery(option.label)
    setOpen(false)
  }

  function handleInputChange(raw: string) {
    setQuery(raw)
    setOpen(true)
    if (raw.trim() === '') {
      onClear()
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return

    if (e.key === 'Escape') {
      e.preventDefault()
      closeList(true)
      return
    }

    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (open && filtered.length > 0) {
        pick(filtered[highlightIndex])
      }
      advanceFormOnEnter(enterFieldKey)
      return
    }

    if (!open || filtered.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
      return
    }
  }

  const showMinLengthHint =
    open && query.trim().length < minSearchLength && minSearchLength > 0
  const showNoResults =
    open &&
    !showMinLengthHint &&
    query.trim().length >= minSearchLength &&
    filtered.length === 0

  return (
    <div className="form-field searchable-select" ref={rootRef}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="searchable-select-control">
        <input
          id={id}
          type="search"
          className="form-input searchable-select-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                closeList(true)
              }
            }, 120)
          }}
          onKeyDown={handleKeyDown}
        />
        {open && !disabled ? (
          <ul id={listId} className="searchable-select-list" role="listbox">
            {showMinLengthHint ? (
              <li className="searchable-select-hint" role="presentation">
                {emptyHint ??
                  `Type at least ${minSearchLength} character${minSearchLength === 1 ? '' : 's'} to search`}
              </li>
            ) : null}
            {showNoResults ? (
              <li className="searchable-select-hint" role="presentation">
                No matches — try a different spelling
              </li>
            ) : null}
            {filtered.map((opt, index) => (
              <li key={`${opt.value}-${opt.label}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === highlightIndex}
                  className={`searchable-select-option${
                    index === highlightIndex ? ' searchable-select-option-active' : ''
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(opt)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { EMOJI_CATALOG } from './emojiCatalog'
import Input from './Input'

function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export default function EmojiPickerField({
  value,
  onChange,
  id,
}: {
  value: string | null
  onChange: (next: string | null) => void
  id?: string
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return EMOJI_CATALOG
    return EMOJI_CATALOG.filter(
      (row) =>
        normalize(row.emoji).includes(q) ||
        row.keywords.some((k) => normalize(k).includes(q) || q.includes(normalize(k))),
    )
  }, [query])

  return (
    <div className="emojiPickerField">
      <div className="emojiPickerToolbar">
        <Input
          id={id}
          type="search"
          placeholder="Buscar emoji (ex: comida, casa...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <button type="button" className="emojiPickerClear" onClick={() => onChange(null)} disabled={!value}>
          Limpar
        </button>
      </div>

      {value ? (
        <div className="emojiPickerCurrent">
          Selecionado: <span className="emojiPickerCurrentSymbol">{value}</span>
        </div>
      ) : null}

      <div className="emojiPickerGrid" role="listbox" aria-label="Emojis sugeridos">
        {filtered.map((row) => {
          const selected = value === row.emoji
          return (
            <button
              key={row.emoji}
              type="button"
              role="option"
              aria-selected={selected}
              className={`emojiPickerCell ${selected ? 'emojiPickerCellSelected' : ''}`}
              title={row.keywords.slice(0, 4).join(', ')}
              onClick={() => onChange(row.emoji)}
            >
              {row.emoji}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? <div className="emojiPickerEmpty">Nenhum emoji encontrado.</div> : null}
    </div>
  )
}

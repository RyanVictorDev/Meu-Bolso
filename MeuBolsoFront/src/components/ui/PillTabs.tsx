import type { ReactNode } from 'react'

export default function PillTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: Array<{ value: T; label: ReactNode }>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div className="pillTabs" role="tablist" aria-label="Tabs">
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            className={active ? 'pillTab pillTabActive' : 'pillTab'}
            onClick={() => onChange(item.value)}
            role="tab"
            aria-selected={active}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}


import { useMemo, useState } from 'react'
import { CURRENT_MONTH } from '../mocks/seed'
import { formatBRLFromCents, monthLabelFromYYYYMM, parseAmountToCents } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'

export default function OrcamentosPage() {
  const { loading, data, setBudgetLimit, resetToSeed } = useFinance()
  const [draft, setDraft] = useState<Record<string, string>>({})

  const despesas = useMemo(() => {
    if (!data) return []
    return data.categories.filter((c) => c.type === 'DESPESA').sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const budgetsByCategory = useMemo(() => {
    if (!data) return new Map<string, number>()
    const map = new Map<string, number>()
    for (const b of data.budgets) {
      if (b.month !== CURRENT_MONTH) continue
      map.set(b.categoryId, b.limitCents)
    }
    return map
  }, [data])

  const monthLabel = useMemo(() => monthLabelFromYYYYMM(CURRENT_MONTH), [])

  if (loading || !data) {
    return (
      <>
        <h1 className="pageTitle">Orçamentos</h1>
        <div className="card">
          <div className="muted">Carregando...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="pageTitle">Orçamentos</h1>
      <div className="pageSubtitle">Defina limites mensais por categoria</div>

      <div className="toolbar">
        <div className="muted" style={{ fontSize: 14 }}>
          {monthLabel}
        </div>
        <Button variant="secondary" onClick={() => void resetToSeed()}>
          Resetar dados
        </Button>
      </div>

      {despesas.length === 0 ? (
        <EmptyState>Sem categorias de despesa.</EmptyState>
      ) : (
        <div className="list">
          {despesas.map((cat) => {
            const cents = budgetsByCategory.get(cat.id) ?? 0
            const current = draft[cat.id] ?? String(cents / 100).replace('.', ',')

            return (
              <div className="row" key={cat.id}>
                <div className="rowLabel">
                  <div className="rowName">{cat.name}</div>
                  <div className="rowHint">Limite mensal</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {formatBRLFromCents(cents)}
                  </div>
                  <Input
                    value={current}
                    inputMode="decimal"
                    onChange={(e) => setDraft((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    onBlur={() => {
                      const input = draft[cat.id] ?? current
                      const parsed = parseAmountToCents(input)
                      const centsNext = parsed ?? cents
                      void setBudgetLimit({
                        month: CURRENT_MONTH,
                        categoryId: cat.id,
                        limitCents: centsNext,
                      }).then(() => {
                        setDraft((prev) => {
                          const copy = { ...prev }
                          delete copy[cat.id]
                          return copy
                        })
                      })
                    }}
                    aria-label={`Limite para ${cat.name}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}


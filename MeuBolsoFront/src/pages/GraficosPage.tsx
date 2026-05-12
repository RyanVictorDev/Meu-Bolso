import { useMemo, useState } from 'react'
import DespesasPorCategoriaDonutChart from '../components/charts/DespesasPorCategoriaDonutChart'
import ReceitasDespesasChart from '../components/charts/ReceitasDespesasChart'
import PageLoader from '../components/PageLoader'
import PillTabs from '../components/ui/PillTabs'
import { formatBRLFromCents } from '../domain/finance'
import { useFinance } from '../services/useFinance'

const TABS = [
  { value: 'resumo', label: 'Resumo' },
  { value: 'despesas', label: 'Despesas' },
  { value: 'metas', label: 'Metas' },
] as const

export default function GraficosPage() {
  const { loading, data } = useFinance()
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('resumo')

  const totals = useMemo(() => {
    const txs = data?.transactions ?? []
    return {
      receitas: txs.filter((tx) => tx.type === 'RECEITA').reduce((acc, tx) => acc + tx.amountCents, 0),
      despesas: txs.filter((tx) => tx.type === 'DESPESA').reduce((acc, tx) => acc + tx.amountCents, 0),
    }
  }, [data])

  const expensesByCategory = useMemo(() => {
    if (!data) return []
    const totalsByCategory = new Map<string, number>()
    data.transactions
      .filter((tx) => tx.type === 'DESPESA')
      .forEach((tx) => totalsByCategory.set(tx.categoryId, (totalsByCategory.get(tx.categoryId) ?? 0) + tx.amountCents))
    return Array.from(totalsByCategory.entries()).map(([categoryId, valueCents], idx) => ({
      label: data.categories.find((category) => category.id === categoryId)?.name ?? 'Categoria',
      valueCents,
      color: idx % 2 === 0 ? '#f59e0b' : '#fbbf24',
    }))
  }, [data])

  if (loading || !data) {
    return (
      <>
        <h1 className="pageTitle">Gráficos</h1>
        <div className="card">
          <PageLoader />
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="pageTitle">Gráficos</h1>
      <div className="pageSubtitle">Análises separadas para despesas, receitas e metas.</div>
      <div className="toolbar">
        <PillTabs items={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === 'resumo' ? (
        <div className="grid2">
          <div className="card">
            <div className="sectionTitle">Receitas vs Despesas</div>
            <ReceitasDespesasChart revenuesCents={totals.receitas} expensesCents={totals.despesas} />
          </div>
          <div className="card">
            <div className="sectionTitle">Totais</div>
            <div className="detailsGrid">
              <div>
                <span className="detailsLabel">Receitas</span>
                <strong className="txAmountIn">{formatBRLFromCents(totals.receitas)}</strong>
              </div>
              <div>
                <span className="detailsLabel">Despesas</span>
                <strong className="txAmountOut">{formatBRLFromCents(totals.despesas)}</strong>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'despesas' ? (
        <div className="card">
          <div className="sectionTitle">Despesas por Categoria</div>
          {expensesByCategory.length === 0 ? (
            <div className="chartEmpty">Sem despesas para analisar</div>
          ) : (
            <DespesasPorCategoriaDonutChart segments={expensesByCategory} />
          )}
        </div>
      ) : null}

      {tab === 'metas' ? (
        <div className="goalsGrid">
          {data.goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentCents / goal.targetCents) * 100))
            return (
              <div className="card goalCard" key={goal.id}>
                <div className="sectionTitle">{goal.name}</div>
                <div className="goalProgressBar">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="goalAmounts">
                  <strong>{progress}%</strong>
                  <span>
                    {formatBRLFromCents(goal.currentCents)} de {formatBRLFromCents(goal.targetCents)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </>
  )
}

import { useMemo } from 'react'
import { formatBRLFromCents } from '../../domain/finance'

export default function ReceitasDespesasChart({
  revenuesCents,
  expensesCents,
  dayLabel,
}: {
  revenuesCents: number
  expensesCents: number
  dayLabel: string
}) {
  const revenues = revenuesCents / 100
  const expenses = expensesCents / 100

  const { roundedMax, ticks, revenueHeight, expenseHeight } = useMemo(() => {
    const max = Math.max(revenues, expenses, 1)
    const step = 5500
    const rounded = Math.max(step, Math.ceil(max / step) * step)
    const tickCount = 4
    const ticksLocal = Array.from({ length: tickCount + 1 }, (_, i) => (rounded / tickCount) * i)

    const revenueH = (revenues / rounded) * 140
    const expenseH = (expenses / rounded) * 140
    return { roundedMax: rounded, ticks: ticksLocal, revenueHeight: revenueH, expenseHeight: expenseH }
  }, [expenses, revenues])

  const W = 420
  const H = 190
  const paddingLeft = 46
  const paddingTop = 16
  const paddingBottom = 34
  const chartH = H - paddingTop - paddingBottom
  const chartW = W - paddingLeft - 16

  const baseY = paddingTop + chartH
  const barW = 120
  const barX = paddingLeft + (chartW - barW) / 2

  const revenueY = baseY - revenueHeight
  const expenseY = baseY - Math.max(expenseHeight, 2)

  return (
    <div className="chartCardInner">
      <svg width="100%" height="210" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Receitas vs Despesas">
        <rect x="0" y="0" width={W} height={H} fill="transparent" />

        {ticks.map((t, idx) => {
          const y = paddingTop + (1 - t / roundedMax) * chartH
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={W - 10} y2={y} stroke="rgba(0,0,0,0.10)" />
              <text x={paddingLeft - 8} y={y + 4} fontSize="11" fill="rgba(0,0,0,0.55)" textAnchor="end">
                {Math.round(t).toLocaleString('pt-BR')}
              </text>
            </g>
          )
        })}

        {/* Revenue bar */}
        <rect
          x={barX}
          y={revenueY}
          width={barW}
          height={Math.max(revenueHeight, 2)}
          rx="2"
          fill="#22c55e"
        />

        {/* Expense small red line/bar */}
        <rect
          x={barX}
          y={expenseY}
          width={barW}
          height={Math.max(expenseHeight, 2)}
          fill="#ef4444"
          opacity="0.7"
        />

        {/* X axis label */}
        <text x={paddingLeft + chartW / 2} y={H - 12} fontSize="11" fill="rgba(0,0,0,0.55)" textAnchor="middle">
          {dayLabel}
        </text>

        {/* Accessibility: show tooltip-like values */}
        <title>
          {`Receitas: ${formatBRLFromCents(revenuesCents)}; Despesas: ${formatBRLFromCents(expensesCents)}`}
        </title>
      </svg>
    </div>
  )
}


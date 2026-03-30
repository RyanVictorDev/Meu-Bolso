import { useMemo } from 'react'
import { formatBRLFromCents } from '../../domain/finance'

export default function ReceitasDespesasChart({
  revenuesCents,
  expensesCents,
}: {
  revenuesCents: number
  expensesCents: number
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
  const H = 200
  const paddingLeft = 46
  const paddingTop = 16
  const paddingBottom = 40
  const chartH = H - paddingTop - paddingBottom
  const chartW = W - paddingLeft - 16

  const baseY = paddingTop + chartH
  const barW = 68
  const gap = 28
  const pairW = barW * 2 + gap
  const startX = paddingLeft + (chartW - pairW) / 2

  const revenueBarX = startX
  const expenseBarX = startX + barW + gap

  const revenueY = baseY - revenueHeight
  const expenseY = baseY - Math.max(expenseHeight, 2)

  const labelY = H - 14

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

        <rect
          x={revenueBarX}
          y={revenueY}
          width={barW}
          height={Math.max(revenueHeight, 2)}
          rx="3"
          fill="#22c55e"
        />

        <rect
          x={expenseBarX}
          y={expenseY}
          width={barW}
          height={Math.max(expenseHeight, 2)}
          rx="3"
          fill="#ef4444"
          opacity="0.92"
        />

        <text
          x={revenueBarX + barW / 2}
          y={labelY}
          fontSize="11"
          fill="rgba(0,0,0,0.55)"
          textAnchor="middle"
          fontWeight="600"
        >
          Receitas
        </text>
        <text
          x={expenseBarX + barW / 2}
          y={labelY}
          fontSize="11"
          fill="rgba(0,0,0,0.55)"
          textAnchor="middle"
          fontWeight="600"
        >
          Despesas
        </text>

        <title>
          {`Receitas: ${formatBRLFromCents(revenuesCents)}; Despesas: ${formatBRLFromCents(expensesCents)}`}
        </title>
      </svg>
    </div>
  )
}

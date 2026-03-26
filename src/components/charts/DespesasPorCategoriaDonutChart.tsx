import { useMemo } from 'react'

type Segment = { label: string; valueCents: number; color: string }

export default function DespesasPorCategoriaDonutChart({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((acc, s) => acc + s.valueCents, 0)

  const { circumference, r, dashParts } = useMemo(() => {
    const radius = 70
    const c = 2 * Math.PI * radius
    const partsState = segments.reduce(
      (state, s) => {
        const fraction = total > 0 ? s.valueCents / total : 0
        const len = c * fraction
        const nextPart = { color: s.color, len, offset: state.offset }
        return { offset: state.offset + len, parts: [...state.parts, nextPart] }
      },
      { offset: 0, parts: [] as Array<{ color: string; len: number; offset: number }> },
    )

    return { circumference: c, r: radius, dashParts: partsState.parts }
  }, [segments, total])

  const W = 240
  const H = 220
  const cx = 120
  const cy = 112

  const strokeWidth = 18

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ minWidth: 140 }}>
        {segments.slice(0, 3).map((s, idx) => {
          const percent = total > 0 ? Math.round((s.valueCents / total) * 100) : 0
          return (
            <div key={`${s.label}_${idx}`} style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              {s.label} {percent}%
            </div>
          )
        })}
      </div>

      <div style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="140" height="140" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Despesas por Categoria">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="rgba(234, 179, 8, 0.18)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {dashParts.map((p, idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={p.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${p.len} ${circumference - p.len}`}
                strokeDashoffset={-p.offset}
                strokeLinecap="round"
              />
            ))}
          </g>
          {/* inner hole */}
          <circle cx={cx} cy={cy} r={46} fill="white" />
        </svg>
      </div>
    </div>
  )
}


import { useMemo } from 'react'

type Segment = { label: string; valueCents: number; color: string }

const VB = 200
const cx = VB / 2
const cy = VB / 2
const r = 78
const strokeWidth = 22
const innerR = 48

export default function DespesasPorCategoriaDonutChart({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((acc, s) => acc + s.valueCents, 0)

  const { circumference, dashParts } = useMemo(() => {
    const c = 2 * Math.PI * r
    const partsState = segments.reduce(
      (state, s) => {
        const fraction = total > 0 ? s.valueCents / total : 0
        const len = c * fraction
        const nextPart = { color: s.color, len, offset: state.offset }
        return { offset: state.offset + len, parts: [...state.parts, nextPart] }
      },
      { offset: 0, parts: [] as Array<{ color: string; len: number; offset: number }> },
    )

    return { circumference: c, dashParts: partsState.parts }
  }, [segments, total])

  return (
    <div className="donutChartRoot">
      <div className="donutChartSvgWrap">
        <svg
          className="donutChartSvg"
          viewBox={`0 0 ${VB} ${VB}`}
          role="img"
          aria-label="Despesas por Categoria"
        >
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
          <circle cx={cx} cy={cy} r={innerR} fill="var(--bg, #fff)" />
        </svg>
      </div>

      <ul className="donutChartLegend">
        {segments.map((s, idx) => {
          const percent = total > 0 ? Math.round((s.valueCents / total) * 100) : 0
          return (
            <li key={`${s.label}_${idx}`} className="donutChartLegendItem">
              <span className="donutChartLegendSwatch" style={{ background: s.color }} aria-hidden />
              <span className="donutChartLegendText">
                {s.label} <span className="donutChartLegendPct">{percent}%</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

import { useMemo } from 'react'
import { useTheme } from './useTheme'

export type ChartCssColors = {
  grid: string
  label: string
  accent: string
  expense: string
  surface: string
  donutTrack: string
}

const defaults: ChartCssColors = {
  grid: 'rgba(0, 0, 0, 0.1)',
  label: 'rgba(0, 0, 0, 0.55)',
  accent: '#22c55e',
  expense: '#ef4444',
  surface: '#ffffff',
  donutTrack: 'rgba(234, 179, 8, 0.18)',
}

function readChartColors(): ChartCssColors {
  if (typeof document === 'undefined') return defaults
  const cs = getComputedStyle(document.documentElement)
  const grid = cs.getPropertyValue('--chart-grid').trim() || defaults.grid
  const label = cs.getPropertyValue('--chart-label').trim() || defaults.label
  const accent = cs.getPropertyValue('--accent').trim() || defaults.accent
  const expense = cs.getPropertyValue('--expense').trim() || defaults.expense
  const surface = cs.getPropertyValue('--surface').trim() || defaults.surface
  const donutTrack = cs.getPropertyValue('--donut-track').trim() || defaults.donutTrack
  return { grid, label, accent, expense, surface, donutTrack }
}

export function useChartCssColors(): ChartCssColors {
  const { mode, accent } = useTheme()
  return useMemo(() => {
    void mode
    void accent
    return readChartColors()
  }, [mode, accent])
}

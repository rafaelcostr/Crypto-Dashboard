import type { ChartPoint } from '../api/onchain'

/** Limite absoluto de valores em séries do lightweight-charts */
export const LW_CHART_VALUE_MAX = 90_071_992_547_409.91

const SCALE_STEPS: { divisor: number; label: string }[] = [
  { divisor: 1e3, label: 'mil' },
  { divisor: 1e6, label: 'milhões' },
  { divisor: 1e9, label: 'bilhões' },
  { divisor: 1e12, label: 'trilhões' },
  { divisor: 1e15, label: 'quatrilhões' },
]

export interface ScaledChartResult {
  points: ChartPoint[]
  divisor: number
  unitLabel: string
}

/** Reduz valores grandes para caber no lightweight-charts; escolhe a maior escala legível. */
export function scaleChartPointsForLightweight(points: ChartPoint[]): ScaledChartResult {
  if (points.length === 0) {
    return { points: [], divisor: 1, unitLabel: '' }
  }

  const maxAbs = Math.max(...points.map((p) => Math.abs(p.value)))
  if (maxAbs <= LW_CHART_VALUE_MAX) {
    return { points, divisor: 1, unitLabel: '' }
  }

  for (let i = SCALE_STEPS.length - 1; i >= 0; i--) {
    const step = SCALE_STEPS[i]
    const scaledMax = maxAbs / step.divisor
    if (scaledMax <= LW_CHART_VALUE_MAX && scaledMax >= 1) {
      return {
        points: points.map((p) => ({ time: p.time, value: p.value / step.divisor })),
        divisor: step.divisor,
        unitLabel: step.label,
      }
    }
  }

  for (let i = SCALE_STEPS.length - 1; i >= 0; i--) {
    const step = SCALE_STEPS[i]
    if (maxAbs / step.divisor <= LW_CHART_VALUE_MAX) {
      return {
        points: points.map((p) => ({ time: p.time, value: p.value / step.divisor })),
        divisor: step.divisor,
        unitLabel: step.label,
      }
    }
  }

  const exp = Math.ceil(Math.log10(maxAbs / LW_CHART_VALUE_MAX))
  const divisor = 10 ** exp
  return {
    points: points.map((p) => ({ time: p.time, value: p.value / divisor })),
    divisor,
    unitLabel: `÷10^${exp}`,
  }
}

export function formatScaledChartValue(
  displayValue: number,
  divisor: number,
  unitLabel: string,
): string {
  const real = displayValue * divisor
  const formatted = new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 4,
  }).format(real)
  if (divisor === 1) return formatted
  return `${formatted} (${unitLabel})`
}

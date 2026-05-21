import { describe, expect, it } from 'vitest'
import { LW_CHART_VALUE_MAX, scaleChartPointsForLightweight } from './chartScale'

describe('scaleChartPointsForLightweight', () => {
  it('não altera valores dentro do limite', () => {
    const points = [{ time: 1, value: 1_000_000 }]
    const r = scaleChartPointsForLightweight(points)
    expect(r.divisor).toBe(1)
    expect(r.points[0].value).toBe(1_000_000)
  })

  it('escala dificuldade de mineração (~90 tri) para trilhões', () => {
    const points = [{ time: 1, value: 90_666_502_495_566 }]
    const r = scaleChartPointsForLightweight(points)
    expect(r.divisor).toBe(1e12)
    expect(r.unitLabel).toBe('trilhões')
    expect(r.points[0].value).toBeCloseTo(90.666, 2)
    expect(Math.abs(r.points[0].value)).toBeLessThanOrEqual(LW_CHART_VALUE_MAX)
  })
})

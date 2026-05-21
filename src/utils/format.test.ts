import { describe, expect, it } from 'vitest'
import { formatPercent, formatPrice, toNum } from './format'

describe('toNum', () => {
  it('returns fallback for null', () => {
    expect(toNum(null)).toBe(0)
    expect(toNum(undefined, 5)).toBe(5)
  })
})

describe('formatPrice', () => {
  it('formats valid price', () => {
    expect(formatPrice(42000)).toContain('42')
  })
  it('returns dash for null', () => {
    expect(formatPrice(null)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('adds plus for positive', () => {
    expect(formatPercent(5.5)).toBe('+5.50%')
  })
  it('handles null', () => {
    expect(formatPercent(null)).toBe('—')
  })
})

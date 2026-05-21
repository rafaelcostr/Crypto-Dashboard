import { describe, expect, it } from 'vitest'
import { periodToDays, periodToBlockchainSpan, TOP_MARKETS } from './constants'

describe('constants', () => {
  it('TOP_MARKETS is 1000', () => {
    expect(TOP_MARKETS).toBe(1000)
  })

  it('maps chart periods', () => {
    expect(periodToDays('1year')).toBe(365)
    expect(periodToBlockchainSpan('5years')).toBe('5years')
  })
})

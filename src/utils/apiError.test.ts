import { describe, expect, it } from 'vitest'
import { formatApiError } from './apiError'

describe('formatApiError', () => {
  it('formats 429', () => {
    const msg = formatApiError(new Error('CoinGecko: 429'), 'Ranking')
    expect(msg).toContain('429')
    expect(msg).toContain('Ranking')
  })

  it('formats network errors', () => {
    const msg = formatApiError(new Error('Failed to fetch'), 'Gráfico')
    expect(msg).toContain('rede')
  })
})

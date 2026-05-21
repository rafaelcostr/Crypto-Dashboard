import { describe, expect, it } from 'vitest'
import { isLikelyPortuguese } from './portugueseFilter'

describe('isLikelyPortuguese', () => {
  it('accepts Portuguese titles', () => {
    expect(
      isLikelyPortuguese(
        'Bitcoin sobe 5% após decisão do Fed sobre juros',
        'O mercado de criptomoedas reagiu positivamente nesta terça-feira.',
      ),
    ).toBe(true)
  })

  it('rejects obvious English titles', () => {
    expect(
      isLikelyPortuguese(
        'Bitcoin price surges after ETF approval says analyst',
        'The crypto market could see more gains according to traders.',
      ),
    ).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { getPaginationRange } from './pagination'

describe('getPaginationRange', () => {
  it('retorna todas as páginas quando total <= 7', () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('insere reticências no meio para muitas páginas', () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 'ellipsis', 10])
    expect(getPaginationRange(5, 10)).toEqual([1, 'ellipsis', 3, 4, 5, 6, 7, 'ellipsis', 10])
  })
})

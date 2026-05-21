import { describe, expect, it, beforeEach } from 'vitest'
import { readCache, writeCache } from './cache'

describe('cache', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('writes and reads within TTL', () => {
    writeCache('test-key', { a: 1 })
    expect(readCache<{ a: number }>('test-key', 60_000)).toEqual({ a: 1 })
  })

  it('returns null when expired', () => {
    writeCache('test-key', [1])
    const entry = sessionStorage.getItem('test-key')
    if (entry) {
      const parsed = JSON.parse(entry)
      parsed.ts = Date.now() - 120_000
      sessionStorage.setItem('test-key', JSON.stringify(parsed))
    }
    expect(readCache('test-key', 60_000)).toBeNull()
  })
})

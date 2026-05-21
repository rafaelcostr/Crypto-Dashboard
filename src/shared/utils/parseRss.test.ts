import { describe, expect, it } from 'vitest'
import { dedupeArticles, stripMarkdown } from './parseRss'
import type { CryptoNews } from '@/shared/types'

describe('stripMarkdown', () => {
  it('removes html tags', () => {
    expect(stripMarkdown('<p>Olá <b>mundo</b></p>')).toBe('Olá mundo')
  })
})

describe('dedupeArticles', () => {
  it('removes duplicate titles', () => {
    const articles: CryptoNews[] = [
      {
        id: '1',
        title: 'Bitcoin sobe',
        body: 'a',
        url: 'u1',
        source: 'X',
        publishedAt: 100,
        categories: [],
      },
      {
        id: '2',
        title: 'Bitcoin sobe',
        body: 'b',
        url: 'u2',
        source: 'Y',
        publishedAt: 200,
        categories: [],
      },
      {
        id: '3',
        title: 'Ethereum',
        body: 'c',
        url: 'u3',
        source: 'Z',
        publishedAt: 300,
        categories: [],
      },
    ]
    const result = dedupeArticles(articles, 10)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Ethereum')
  })
})

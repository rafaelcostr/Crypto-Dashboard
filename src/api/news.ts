import type { CryptoNews } from '../types'
import { dedupeArticles, parseRssXml } from '../utils/parseRss'
import { filterPortugueseNews } from '../utils/portugueseFilter'

/** Apenas portais em português do Brasil */
const RSS_FEEDS_PT: { path: string; source: string; category: string }[] = [
  { path: '/api/rss/livecoins', source: 'Livecoins', category: 'Brasil' },
  { path: '/api/rss/portaldobitcoin', source: 'Portal do Bitcoin', category: 'Brasil' },
  { path: '/api/rss/criptofacil', source: 'CriptoFácil', category: 'Brasil' },
  { path: '/api/rss/beincrypto-br', source: 'BeInCrypto Brasil', category: 'Brasil' },
  { path: '/api/rss/portalcripto', source: 'Portal Cripto', category: 'Brasil' },
]

const COIN_SEARCH_ALIASES: Record<string, string[]> = {
  BTC: ['bitcoin', 'btc'],
  ETH: ['ethereum', 'eth', 'ether'],
  SOL: ['solana', 'sol'],
  XRP: ['ripple', 'xrp'],
  BNB: ['binance', 'bnb'],
  ADA: ['cardano', 'ada'],
  DOGE: ['dogecoin', 'doge'],
  DOT: ['polkadot', 'dot'],
  AVAX: ['avalanche', 'avax'],
  LINK: ['chainlink', 'link'],
}

async function fetchRssFeed(
  path: string,
  source: string,
  category: string,
): Promise<CryptoNews[]> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${source} RSS: ${res.status}`)
  const xml = await res.text()
  return parseRssXml(xml, source, category)
}

async function fetchViaProxyFeeds(limit: number): Promise<CryptoNews[]> {
  const perFeed = 6

  const rssResults = await Promise.allSettled(
    RSS_FEEDS_PT.map((f) => fetchRssFeed(f.path, f.source, f.category)),
  )

  const articles = filterPortugueseNews(
    rssResults
      .filter((r): r is PromiseFulfilledResult<CryptoNews[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value.slice(0, perFeed)),
  )

  if (articles.length === 0 && rssResults.every((r) => r.status === 'rejected')) {
    throw new Error(
      'Notícias indisponíveis. Rode com "npm run dev" ou faça deploy na Vercel.',
    )
  }

  return dedupeArticles(articles, limit)
}

async function fetchViaServerless(limit: number): Promise<CryptoNews[]> {
  const res = await fetch(`/api/news?limit=${limit}`)
  if (!res.ok) throw new Error(`API notícias: ${res.status}`)
  const json = (await res.json()) as { articles?: CryptoNews[]; error?: string }
  if (json.error) throw new Error(json.error)
  return filterPortugueseNews(json.articles ?? [])
}

export async function fetchCryptoNews(limit = 18): Promise<CryptoNews[]> {
  let articles: CryptoNews[]

  if (import.meta.env.PROD) {
    try {
      articles = await fetchViaServerless(limit)
    } catch {
      articles = await fetchViaProxyFeeds(limit)
    }
  } else {
    articles = await fetchViaProxyFeeds(limit)
  }

  return dedupeArticles(articles, limit)
}

export function filterNewsForCoin(
  articles: CryptoNews[],
  symbol: string,
  name: string,
  limit = 12,
): CryptoNews[] {
  const sym = symbol.toUpperCase()
  const aliases = [
    sym.toLowerCase(),
    name.toLowerCase(),
    ...(COIN_SEARCH_ALIASES[sym] ?? []),
  ]

  const filtered = articles.filter((a) => {
    const text = `${a.title} ${a.body}`.toLowerCase()
    return aliases.some(
      (term) => term.length >= 3 && text.includes(term),
    )
  })

  return filtered.slice(0, limit)
}

export async function fetchCryptoNewsForCoin(
  symbol: string,
  name: string,
  limit = 12,
): Promise<CryptoNews[]> {
  const all = await fetchCryptoNews(40)
  return filterNewsForCoin(all, symbol, name, limit)
}

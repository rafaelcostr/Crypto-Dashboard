import { XMLParser } from 'fast-xml-parser'

const FEEDS_PT = [
  { url: 'https://livecoins.com.br/feed/', source: 'Livecoins' },
  { url: 'https://portaldobitcoin.uol.com.br/feed/', source: 'Portal do Bitcoin' },
  { url: 'https://criptofacil.com/feed/', source: 'CriptoFácil' },
  { url: 'https://beincrypto.com.br/feed/', source: 'BeInCrypto Brasil' },
  { url: 'https://portalcripto.com.br/feed/', source: 'Portal Cripto' },
]

const parser = new XMLParser({ ignoreAttributes: false })

function isLikelyPortuguese(title, body = '') {
  const text = `${title} ${body}`.toLowerCase()
  const pt = (
    text.match(
      /\b(não|nao|para|como|mais|mercado|bitcoin|ethereum|cripto|criptomoedas|segundo|após|apos|sobre|entre|pela|pelo|está|esta|foram|será|sera|invest|dólar|dolar|brasil|banco|regul|análise|analise|queda|alta|valor|moeda|blockchain)\b/gi,
    ) ?? []
  ).length
  const en = (
    text.match(
      /\b(the|and|with|will|says|said|crypto|market|after|before|could|would|has been|breaking|according|million|billion|trading|price|surge|crash)\b/gi,
    ) ?? []
  ).length
  if (/[ãõçáéíóúâêô]/i.test(text)) return true
  if (en >= 3 && en > pt + 1) return false
  if (pt >= 1 && pt >= en) return true
  if (en >= 2 && pt === 0) return false
  return pt >= en
}

function stripHtml(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseFeed(xml, source) {
  const parsed = parser.parse(xml)
  const channel = parsed.rss?.channel ?? parsed.feed
  const rawItems = channel?.item ?? channel?.entry ?? []
  const items = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items.slice(0, 6).map((item, index) => {
    const title = stripHtml(item.title?.['#text'] ?? item.title ?? 'Sem título')
    const link = item.link?.['@_href'] ?? item.link ?? item.guid ?? '#'
    const description = stripHtml(
      item.description ?? item['content:encoded'] ?? item.summary ?? title,
    )
    const pubDate = item.pubDate ?? item.published ?? item.updated
    const publishedAt = pubDate ? new Date(pubDate).getTime() : Date.now() - index * 60000

    return {
      id: `rss-${source}-${index}`,
      title,
      body: description || title,
      url: typeof link === 'string' ? link : '#',
      source,
      publishedAt: Number.isNaN(publishedAt) ? Date.now() : publishedAt,
      categories: ['Brasil'],
    }
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const limit = Math.min(Number(req.query?.limit) || 18, 30)

  const results = await Promise.allSettled(
    FEEDS_PT.map(async (feed) => {
      const r = await fetch(feed.url, {
        headers: { 'User-Agent': 'crypto-dashboard/1.0' },
      })
      if (!r.ok) throw new Error(`${feed.source}: ${r.status}`)
      const xml = await r.text()
      return parseFeed(xml, feed.source)
    }),
  )

  const articles = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  if (articles.length === 0) {
    return res.status(502).json({ error: 'Nenhum feed disponível', articles: [] })
  }

  const seen = new Set()
  const sorted = articles
    .filter((a) => isLikelyPortuguese(a.title, a.body))
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .filter((a) => {
      const key = a.title.toLowerCase().slice(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, limit)

  return res.status(200).json({ articles: sorted })
}

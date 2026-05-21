import type { CryptoNews } from '@/shared/types'

export function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseRssXml(xml: string, source: string, category: string): CryptoNews[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const items = doc.querySelectorAll('item')

  return Array.from(items).slice(0, 8).map((item, index) => {
    const title = item.querySelector('title')?.textContent?.trim() ?? 'Sem título'
    const link = item.querySelector('link')?.textContent?.trim() ?? '#'
    const description =
      item.querySelector('description')?.textContent?.trim() ??
      item.querySelector('content\\:encoded, encoded')?.textContent?.trim() ??
      title
    const pubDate = item.querySelector('pubDate')?.textContent?.trim()
    const publishedAt = pubDate ? new Date(pubDate).getTime() : Date.now() - index * 60000

    const enclosure = item.querySelector('enclosure')?.getAttribute('url')
    const media = item.querySelector('media\\:content, content')?.getAttribute('url')

    return {
      id: `rss-${source}-${index}-${link.slice(-20)}`,
      title,
      body: stripMarkdown(description),
      url: link,
      source,
      imageUrl: enclosure ?? media ?? undefined,
      publishedAt: Number.isNaN(publishedAt) ? Date.now() : publishedAt,
      categories: [category],
    }
  })
}

export function dedupeArticles(articles: CryptoNews[], limit: number): CryptoNews[] {
  const seen = new Set<string>()
  return articles
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .filter((a) => {
      const key = a.title.toLowerCase().slice(0, 60)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, limit)
}

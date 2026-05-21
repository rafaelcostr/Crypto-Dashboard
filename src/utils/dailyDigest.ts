import type { CryptoNews } from '../types'

/** Resumo diário local a partir dos títulos das notícias */
export function buildDailyDigest(articles: CryptoNews[], max = 5): string {
  if (articles.length === 0) return 'Sem notícias disponíveis hoje.'

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const bullets = articles.slice(0, max).map((a, i) => `${i + 1}. ${a.title}`)
  return `Hoje (${today}):\n${bullets.join('\n')}`
}

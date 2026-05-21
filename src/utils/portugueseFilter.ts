import type { CryptoNews } from '../types'

/** Heurística simples: descarta títulos claramente em inglês */
export function isLikelyPortuguese(title: string, body = ''): boolean {
  const text = `${title} ${body}`.toLowerCase()

  const ptHits = (
    text.match(
      /\b(não|nao|para|como|mais|mercado|bitcoin|ethereum|cripto|criptomoedas|segundo|após|apos|sobre|entre|pela|pelo|está|esta|foram|será|sera|invest|dólar|dolar|brasil|banco|regul|análise|analise|queda|alta|valor|moeda|blockchain)\b/gi,
    ) ?? []
  ).length

  const enHits = (
    text.match(
      /\b(the|and|with|will|says|said|crypto|market|after|before|could|would|has been|breaking|according|million|billion|trading|price|surge|crash)\b/gi,
    ) ?? []
  ).length

  if (/[ãõçáéíóúâêô]/i.test(text)) return true
  if (enHits >= 3 && enHits > ptHits + 1) return false
  if (ptHits >= 1 && ptHits >= enHits) return true
  if (enHits >= 2 && ptHits === 0) return false

  return ptHits >= enHits
}

export function filterPortugueseNews(articles: CryptoNews[]): CryptoNews[] {
  return articles.filter((a) => isLikelyPortuguese(a.title, a.body))
}

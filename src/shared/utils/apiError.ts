export function formatApiError(error: unknown, context: string): string {
  const msg = error instanceof Error ? error.message : String(error)

  if (msg.includes('429')) {
    return `${context}: limite de requisições (429). Aguarde ~1 minuto e clique em Atualizar.`
  }
  if (msg.includes('403')) {
    return `${context}: acesso bloqueado (403). Configure a variável COINGECKO_API_KEY na Vercel (plano demo gratuito) e faça um novo deploy.`
  }
  if (msg.includes('400')) {
    return `${context}: parâmetro inválido (400). Tente outro período ou reinicie com npm run dev.`
  }
  if (
    msg.includes('fetch') ||
    msg.includes('Failed') ||
    msg.includes('Network') ||
    msg.includes('CORS')
  ) {
    return `${context}: falha de rede. Use npm run dev ou deploy na Vercel com rotas /api.`
  }
  if (msg.includes('502') || msg.includes('503')) {
    return `${context}: servidor temporariamente indisponível. Tente novamente.`
  }

  return msg.startsWith(context) ? msg : `${context}: ${msg}`
}

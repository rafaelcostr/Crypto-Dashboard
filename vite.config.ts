import type { IncomingMessage, ServerResponse } from 'http'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error middleware ESM sem tipos
import { createAuthDevMiddleware } from './server/authDevMiddleware.mjs'

/** Dev: /api/blockchain-chart?name=... (mesma rota da Vercel) */
function blockchainChartDevProxy(): Plugin {
  return {
    name: 'blockchain-chart-dev-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/blockchain-chart',
        async (req: IncomingMessage, res: ServerResponse, next) => {
          if (req.method !== 'GET' || !req.url) return next()

          const url = new URL(req.url, 'http://localhost')
          const name = url.searchParams.get('name') ?? url.searchParams.get('chart')
          const timespan = url.searchParams.get('timespan') || '2years'

          if (!name) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Parâmetro name obrigatório' }))
            return
          }

          try {
            const upstream = `https://api.blockchain.info/charts/${encodeURIComponent(name)}?timespan=${encodeURIComponent(timespan)}&format=json&sampled=true`
            const response = await fetch(upstream, {
              headers: { 'User-Agent': 'crypto-dashboard/1.0' },
            })
            const body = await response.text()
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          } catch (e) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: e instanceof Error ? e.message : 'Erro ao buscar gráfico',
              }),
            )
          }
        },
      )
    },
  }
}

const rssProxies: Record<string, object> = {
  '/api/coingecko': {
    target: 'https://api.coingecko.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/coingecko/, '/api/v3'),
  },
  '/api/blockchain': {
    target: 'https://api.blockchain.info',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/blockchain/, ''),
  },
  '/api/binance': {
    target: 'https://api.binance.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/binance/, ''),
  },
  '/api/reddit': {
    target: 'https://www.reddit.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/reddit/, ''),
    headers: { 'User-Agent': 'crypto-dashboard/1.0' },
  },
  '/api/rss/livecoins': {
    target: 'https://livecoins.com.br',
    changeOrigin: true,
    rewrite: () => '/feed/',
  },
  '/api/rss/portalcripto': {
    target: 'https://portalcripto.com.br',
    changeOrigin: true,
    rewrite: () => '/feed/',
  },
  '/api/rss/criptofacil': {
    target: 'https://criptofacil.com',
    changeOrigin: true,
    rewrite: () => '/feed/',
  },
  '/api/rss/beincrypto-br': {
    target: 'https://beincrypto.com.br',
    changeOrigin: true,
    rewrite: () => '/feed/',
  },
  '/api/rss/portaldobitcoin': {
    target: 'https://portaldobitcoin.uol.com.br',
    changeOrigin: true,
    rewrite: () => '/feed/',
  },
  '/api/rss/coindesk': {
    target: 'https://www.coindesk.com',
    changeOrigin: true,
    rewrite: () => '/arc/outboundfeeds/rss/',
  },
  '/api/rss/cointelegraph': {
    target: 'https://cointelegraph.com',
    changeOrigin: true,
    rewrite: () => '/rss',
  },
  '/api/rss/decrypt': {
    target: 'https://decrypt.co',
    changeOrigin: true,
    rewrite: () => '/feed',
  },
}

function authDevProxy(): Plugin {
  return {
    name: 'auth-dev-proxy',
    configureServer(server) {
      server.middlewares.use(createAuthDevMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), blockchainChartDevProxy(), authDevProxy()],
  server: { proxy: rssProxies },
  preview: { proxy: rssProxies },
})

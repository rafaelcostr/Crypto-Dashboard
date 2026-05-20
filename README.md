# Crypto Dashboard

Dashboard de criptomoedas em React com preços em tempo real, ranking, alertas de preço e notícias com resumo por IA.

## Funcionalidades

- **Preços em tempo real** — WebSocket da Binance (`!ticker@arr`)
- **Ranking** — Top 50 por market cap via CoinGecko
- **Alertas** — Acima/abaixo de um preço em USD (persistidos no `localStorage`)
- **Notícias** — Feed CryptoCompare
- **Resumo de notícias** — Local por padrão; com `VITE_OPENAI_API_KEY` usa IA (OpenAI-compatible)

## Tecnologias

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- APIs públicas: CoinGecko, Binance, CryptoCompare

## Como rodar

```bash
cd crypto-dashboard
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

### Resumo com IA (opcional)

Copie `.env.example` para `.env` e configure:

```env
VITE_OPENAI_API_KEY=sua_chave
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-4o-mini
```

Sem a chave, o botão **Resumir** usa um resumo local (extrativo).

## Build

```bash
npm run build
npm run preview
```

## Limitações das APIs gratuitas

- CoinGecko: rate limit (~10–30 req/min no plano free)
- Binance WS: apenas pares `*USDT` rastreados no código
- CryptoCompare: notícias em inglês na fonte; resumos em português quando usar IA

## Estrutura

```
src/
  api/          # CoinGecko, Binance WS, notícias
  components/   # UI
  hooks/        # Estado e efeitos
  utils/        # Formatação e resumo
```

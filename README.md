# Crypto Dashboard

Dashboard de criptomoedas em React: **Top 1000** por market cap, preços ao vivo (Binance WS nos top 100), portfólio com P&L, alertas (preço e %), notícias PT-BR, gráficos on-chain estilo Bitcoin Magazine Pro.

## Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| **Top 1000** | Ranking CoinGecko com cache, busca e paginação na tabela |
| **Preços ao vivo** | WebSocket Binance (até 100 pares USDT) |
| **Top movers** | Maiores altas e quedas 24h |
| **Contas** | Registro e login · portfólio salvo por usuário |
| **Portfólio** | P&L, histórico, export CSV/JSON (requer login) |
| **Alertas** | Acima/abaixo + variação % em X minutos + histórico |
| **Gráficos on-chain** | MVRV Z-Score/Ratio Pro, hash rate, volume, ETH, F&G |
| **Período** | 1 ano · 2 anos · 5 anos · máximo |
| **Tema gráfico** | Auto · claro · escuro + export PNG |
| **Crosshair** | Valores ao passar o mouse |
| **Notícias PT-BR** | RSS + cache + resumo diário + filtro por moeda |
| **IA** | `/api/summarize` na Vercel ou `VITE_OPENAI_API_KEY` |
| **PWA** | Instalável (manifest + service worker) |
| **Busca global** | Moedas, gráficos e páginas |
| **Widgets** | Dashboard personalizável |

## Stack

- React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- lightweight-charts, react-router-dom
- APIs: CoinGecko, Binance, Blockchain.com, Alternative.me, RSS

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173

### Contas e portfólio

1. **Criar conta** → e-mail de confirmação (ou link na tela se SMTP não estiver configurado).
2. **Entrar** → **Portfólio** e **Conta** (alterar senha/e-mail).
3. **Admin** — só o e-mail em `ADMIN_EMAIL` vê o painel e pode remover usuários.

Copie `.env.example` para `.env` e configure:

- `ADMIN_EMAIL` — seu e-mail de administrador
- `SMTP_*` — para enviar confirmação de cadastro (senha de app no Gmail)
- `AUTH_JWT_SECRET` — chave longa em produção

Dados dos usuários: `data/auth-store.json` (local / `npm run dev`).

### Testes

```bash
npm test
```

### Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

```bash
npx vercel
```

Rotas serverless:

- `/api/news` — RSS PT-BR
- `/api/blockchain/charts/:chart` — proxy Blockchain.com
- `/api/blockchain-chart?name=...` — proxy alternativo
- `/api/summarize` — resumo IA (requer `OPENAI_API_KEY` no servidor)

## Variáveis de ambiente

**Servidor (Vercel):**

```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1   # opcional
OPENAI_MODEL=gpt-4o-mini                    # opcional
```

**Cliente (opcional):**

```env
VITE_OPENAI_API_KEY=       # resumo no browser (dev)
VITE_OPENAI_BASE_URL=
VITE_OPENAI_MODEL=
```

## Estrutura

```
src/
  api/           CoinGecko, Binance, on-chain, news
  components/    UI, gráficos, top movers, busca
  context/       Tema, mercados, gráficos
  hooks/         Dados e estado
  pages/         Dashboard, charts, news, portfolio
api/             Serverless Vercel
public/          PWA manifest, service worker
```

## Roadmap concluído

- [x] Top 1000 ranking
- [x] Gráficos nativos Pro + período + export PNG
- [x] Alertas % e histórico
- [x] Portfólio export + gráfico histórico
- [x] PWA, busca global, widgets
- [ ] Auth / sync nuvem (Supabase) — futuro

---

Projeto de portfolio — não constitui aconselhamento financeiro.

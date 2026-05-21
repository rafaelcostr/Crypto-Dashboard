# Arquitetura — Crypto Dashboard

Projeto organizado em **módulos por domínio** (feature-based), com código compartilhado em `shared/` e rotas em `app/`.

## Estrutura

```
src/
├── app/                    # Bootstrap e rotas
│   └── App.tsx
├── main.tsx
├── shared/                 # Código reutilizável entre módulos
│   ├── types/              # Tipos globais
│   ├── constants.ts
│   ├── utils/              # format, cache, apiError, pagination…
│   ├── components/         # UI genérica (ErrorBoundary, PasswordInput…)
│   ├── layout/             # MainLayout (shell + nav)
│   └── context/            # ThemeContext
└── features/               # Módulos de negócio
    ├── auth/               # Login, cadastro, conta, JWT
    ├── markets/            # Ranking, favoritos, preços ao vivo
    ├── charts/             # Gráficos on-chain
    ├── portfolio/          # Compras, alertas, carteira
    ├── news/               # RSS e resumos
    ├── coin/               # Página da moeda
    └── admin/              # Painel administrador

api/                        # Serverless Vercel (espelha domínios)
├── auth/[[...path]].js
├── coingecko.js
├── news.js
├── user/data.js
├── admin/users.js
└── lib/                    # Handlers compartilhados do servidor
```

## Alias de import

Use `@/` em vez de caminhos relativos longos:

```ts
import { useAuth } from '@/features/auth/context/AuthContext'
import { formatPrice } from '@/shared/utils/format'
```

Configurado em `tsconfig.app.json` e `vite.config.ts`.

## Responsabilidades por módulo

| Módulo | Contém | Depende de |
|--------|--------|------------|
| **shared** | Tipos, utils, tema, layout shell | — |
| **auth** | API auth, AuthContext, páginas login/conta | shared |
| **markets** | CoinGecko, Binance WS, tabela, dashboard | shared, auth (favoritos na nuvem) |
| **charts** | On-chain, catálogo de gráficos, ChartDetail | shared |
| **portfolio** | Compras, alertas, gráficos da carteira | shared, auth, markets |
| **news** | RSS, resumo IA, NewsPage | shared |
| **coin** | Página `/coin/:id` | markets, news, portfolio |
| **admin** | Lista/remoção de usuários | auth |

## Fluxo de dados

1. **Páginas** (`features/*/pages`) compõem componentes e hooks.
2. **Hooks** buscam dados e aplicam cache local.
3. **API clients** (`features/*/api`) chamam `/api/*` (Vite proxy no dev, Vercel em produção).
4. **Contexts** expõem estado global por domínio (Auth, Markets, Favorites, Chart theme).

## Backend (Vercel)

- Máximo 12 funções no plano Hobby → rotas agrupadas (`auth/[[...path]]`, `coingecko.js` + rewrite).
- Dados de usuário: `data/auth-store.json` (local) ou `/tmp` (Vercel).
- Variáveis: `AUTH_JWT_SECRET`, `APP_URL`, `ADMIN_EMAIL`, `COINGECKO_API_KEY`, SMTP opcional.

## Manutenção

- Novo recurso de **mercado** → `features/markets/`
- Novo gráfico on-chain → `features/charts/data/chartCatalog.ts` + componente em `charts/components/`
- Nova rota de API → `api/` + client em `features/*/api/`
- Código usado em 2+ módulos → mover para `shared/`

## Scripts úteis

```bash
npm run dev              # Desenvolvimento
npm run build            # Build produção
npm test                 # Testes (utils em shared/)
npm run reset-password   # Redefinir senha local
```

# Segurança / Security

Este documento descreve as principais práticas de segurança do Crypto Dashboard, com foco em produção.

## Variáveis de ambiente / Environment variables

- `AUTH_JWT_SECRET` (obrigatório / required)
  - Deve conter pelo menos 32 caracteres.
  - É usado para assinar tokens JWT de autenticação.
  - Se não estiver configurado, o servidor não inicia.

- `APP_URL` (obrigatório / required)
  - Deve apontar para a URL pública do app (`https://seu-app.vercel.app`).
  - Usado para gerar links de confirmação por e-mail.

- `ALLOWED_ORIGIN` (recomendado / recommended)
  - Domínio autorizado para CORS quando o app estiver em produção.
  - Exemplo: `https://seu-app.vercel.app`
  - Se não estiver definido, o app usa `APP_URL` como origem confiável.

- `ADMIN_EMAIL` (obrigatório / required)
  - Define o usuário administrador que pode acessar o painel de administração.

- `COINGECKO_API_KEY` (recomendado / recommended)
  - Evita bloqueios de API e problemas de limitação no CoinGecko em produção.

- `SMTP_*` (opcional / optional)
  - Configure para envio de e-mails de verificação e alteração de e-mail.
  - Em desenvolvimento, o link de confirmação é exibido no console.

## CORS

- O backend não usa mais `*` em `Access-Control-Allow-Origin` em produção.
- `ALLOWED_ORIGIN` e `APP_URL` são usados para restringir quais origens podem acessar a API.
- Em desenvolvimento, `http://localhost:5173` e `http://127.0.0.1:5173` são permitidos.

## Senhas / Passwords

- A política mínima de senha exige 8 caracteres.
- As senhas devem conter letras e números.
- Senhas antigas continuam válidas até serem alteradas, mas novos cadastros e atualizações já seguem a regra mais forte.

## Autenticação / Authentication

- A autenticação usa JWT com expiração de 30 dias.
- Tokens são assinados com `AUTH_JWT_SECRET` seguro.
- O backend valida o token em todos os endpoints que exigem autenticação.

## Rate limiting

- Endpoints críticos de autenticação (`register`, `login`, `resend-verification`, `reset-password-key`) têm proteção básica contra excesso de requisições.
- Essa proteção ajuda a reduzir tentativas de força bruta e abuso, mesmo em ambientes serverless.

## Armazenamento de usuários

- O armazenamento padrão usa `data/auth-store.json` em desenvolvimento e `/tmp/crypto-dashboard-auth-store.json` no Vercel.
- Em produção, é recomendável usar `AUTH_STORE_PATH` para apontar para um caminho gravável ou migrar para um banco de dados real.
 - Opcional: suporte a SQLite via `AUTH_STORE_DB` (mantém compatibilidade com o formato JSON existente).
   - Para habilitar, instale `better-sqlite3` e defina `AUTH_STORE_DB` com o caminho do arquivo `.db`.
   - Exemplo de instalação:
     ```bash
     npm install better-sqlite3
     ```
   - Nota: `better-sqlite3` é um módulo nativo; em ambientes Windows você pode precisar do Visual Studio Build Tools e compatibilidade com a versão do Node.

## Recomendações de deploy / Deployment recommendations

- Não deixe segredos no código ou no repositório.
- Use HTTPS em produção e configure `APP_URL` para a URL final do app.
- Configure `ALLOWED_ORIGIN` para o domínio do frontend.
- Monitore logs para erros de autenticação, CORS e falhas de envio de e-mail.

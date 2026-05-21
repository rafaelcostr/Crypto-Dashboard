import { Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function RegisterSuccessPage() {
  const location = useLocation()
  const state = location.state as {
    email?: string
    message?: string
    devVerifyLink?: string | null
  } | null

  const email = state?.email ?? ''
  const message =
    state?.message ??
    'Enviamos um link de confirmação para o seu e-mail. Abra-o para ativar a conta.'

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">Confirme seu e-mail</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>
        {email && (
          <p className="mt-2 font-mono text-sm text-[var(--color-accent)]">{email}</p>
        )}

        {state?.devVerifyLink && (
          <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-left text-xs">
            <p className="mb-2 font-medium text-yellow-400">Modo desenvolvimento (SMTP não configurado)</p>
            <a
              href={state.devVerifyLink}
              className="break-all text-[var(--color-accent)] hover:underline"
            >
              {state.devVerifyLink}
            </a>
          </div>
        )}

        <Link
          to="/login"
          className="mt-6 inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#0a0e17]"
        >
          Ir para login
        </Link>
      </div>
    </div>
  )
}

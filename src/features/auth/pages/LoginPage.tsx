import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { resendVerification } from '@/features/auth/api/auth'
import { PasswordInput } from '@/shared/components/PasswordInput'
import { useAuth } from '@/features/auth/context/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = (location.state as { redirect?: string } | null)?.redirect ?? '/portfolio'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [needsVerify, setNeedsVerify] = useState(false)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to={redirect} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNeedsVerify(false)
    setDevLink(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(redirect, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar'
      setError(msg)
      if (msg.includes('Confirme seu e-mail')) setNeedsVerify(true)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    try {
      const r = await resendVerification(email)
      setError(r.message)
      setDevLink(r.devVerifyLink ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao reenviar')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Entrar</h1>
            <p className="text-sm text-[var(--color-muted)]">
              Acesse seu portfólio em qualquer dispositivo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Senha</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          {devLink && (
            <a href={devLink} className="block break-all text-xs text-[var(--color-accent)] hover:underline">
              {devLink}
            </a>
          )}
          {needsVerify && (
            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Reenviar e-mail de confirmação
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#0a0e17] transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
          Não tem conta?{' '}
          <Link to="/register" state={{ redirect }} className="text-[var(--color-accent)] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}

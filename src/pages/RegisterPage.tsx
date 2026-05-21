import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PasswordInput } from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = (location.state as { redirect?: string } | null)?.redirect ?? '/portfolio'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to={redirect} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    setSubmitting(true)
    try {
      const result = await register(email, password, name.trim() || undefined)
      navigate('/register/success', {
        state: { email: result.email, message: result.message, devVerifyLink: result.devVerifyLink },
        replace: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Criar conta</h1>
            <p className="text-sm text-[var(--color-muted)]">
              Enviaremos um e-mail para confirmar o cadastro
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Nome (opcional)</label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
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
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Confirmar senha</label>
            <PasswordInput
              value={confirm}
              onChange={setConfirm}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#0a0e17] transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
          Já tem conta?{' '}
          <Link to="/login" state={{ redirect }} className="text-[var(--color-accent)] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

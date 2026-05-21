import { CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmailToken } from '../api/auth'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Link inválido.')
      return
    }
    verifyEmailToken(token)
      .then((r) => {
        setStatus('ok')
        setMessage(r.message)
      })
      .catch((e) => {
        setStatus('error')
        setMessage(e instanceof Error ? e.message : 'Falha na verificação')
      })
  }, [token])

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        {status === 'loading' && (
          <p className="text-sm text-[var(--color-muted)]">Confirmando e-mail...</p>
        )}
        {status === 'ok' && (
          <>
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-[var(--color-accent)]" />
            <h1 className="text-xl font-bold">E-mail confirmado</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#0a0e17]"
            >
              Entrar agora
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-3 h-12 w-12 text-[var(--color-danger)]" />
            <h1 className="text-xl font-bold">Não foi possível confirmar</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>
            <Link to="/login" className="mt-4 block text-sm text-[var(--color-accent)] hover:underline">
              Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

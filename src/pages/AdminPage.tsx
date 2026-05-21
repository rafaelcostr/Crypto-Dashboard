import { Shield, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { deleteAdminUser, fetchAdminUsers, type AdminUserRow } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export function AdminPage() {
  const { user, loading } = useAuth()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await fetchAdminUsers()
      setUsers(data.users)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    }
  }, [])

  useEffect(() => {
    if (user?.isAdmin) load()
  }, [user?.isAdmin, load])

  if (loading) {
    return <p className="text-sm text-[var(--color-muted)]">Carregando...</p>
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remover permanentemente a conta ${email}?`)) return
    setBusyId(id)
    try {
      await deleteAdminUser(id)
      setUsers((list) => list.filter((u) => u.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao remover')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-7 w-7 text-[var(--color-accent)]" />
            Painel administrador
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Apenas o e-mail configurado em ADMIN_EMAIL pode acessar · {users.length} usuário(s)
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-panel-hover)]"
        >
          Atualizar
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--color-danger)]/30 bg-red-500/10 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)]">
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Compras</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--color-border)]/50">
                <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3">{u.name || '—'}</td>
                <td className="px-4 py-3">
                  {u.emailVerified ? (
                    <span className="text-green-400">Confirmado</span>
                  ) : (
                    <span className="text-yellow-400">Pendente</span>
                  )}
                  {u.pendingEmail && (
                    <span className="block text-xs text-[var(--color-muted)]">
                      → {u.pendingEmail}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{u.purchasesCount}</td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                  {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user.id ? (
                    <button
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() => handleDelete(u.id, u.email)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)]">Você</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { Settings, Shield } from 'lucide-react'
import { useState } from 'react'
import { changeEmail, changePassword, updateProfile } from '../api/auth'
import { PasswordInput } from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'

export function AccountPage() {
  const { user, refreshSession, setUser } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [profileMsg, setProfileMsg] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailMsg, setEmailMsg] = useState<string | null>(null)
  const [emailDevLink, setEmailDevLink] = useState<string | null>(null)

  if (!user) return null

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg(null)
    try {
      const { user: updated } = await updateProfile(name)
      setUser(updated)
      setProfileMsg('Nome atualizado.')
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : 'Erro')
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg('As senhas não coincidem')
      return
    }
    try {
      const r = await changePassword(currentPassword, newPassword)
      setPasswordMsg(r.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : 'Erro')
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailMsg(null)
    setEmailDevLink(null)
    try {
      const r = await changeEmail(newEmail, emailPassword)
      setEmailMsg(r.message)
      setEmailDevLink(r.devVerifyLink ?? null)
      await refreshSession()
      setEmailPassword('')
    } catch (err) {
      setEmailMsg(err instanceof Error ? err.message : 'Erro')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minha conta</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Altere nome, senha ou e-mail · {user.email}
        </p>
        {!user.emailVerified && (
          <p className="mt-2 text-sm text-yellow-400">E-mail ainda não confirmado.</p>
        )}
        {user.pendingEmail && (
          <p className="mt-2 text-sm text-[var(--color-accent)]">
            Confirmação pendente para: {user.pendingEmail}
          </p>
        )}
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Settings className="h-4 w-4" />
          Perfil
        </h2>
        <form onSubmit={handleProfile} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          {profileMsg && <p className="text-xs text-[var(--color-muted)]">{profileMsg}</p>}
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-accent)]/15 px-4 py-2 text-sm font-medium text-[var(--color-accent)]"
          >
            Salvar nome
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4" />
          Alterar senha
        </h2>
        <form onSubmit={handlePassword} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Senha atual</label>
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Nova senha</label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Confirmar nova senha</label>
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} required />
          </div>
          {passwordMsg && <p className="text-xs text-[var(--color-muted)]">{passwordMsg}</p>}
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-accent)]/15 px-4 py-2 text-sm font-medium text-[var(--color-accent)]"
          >
            Atualizar senha
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <h2 className="mb-4 text-sm font-semibold">Alterar e-mail</h2>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          Enviaremos confirmação para o novo e-mail. O atual permanece até você confirmar.
        </p>
        <form onSubmit={handleEmail} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Novo e-mail</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Senha (confirmação)</label>
            <PasswordInput value={emailPassword} onChange={setEmailPassword} required />
          </div>
          {emailMsg && <p className="text-xs text-[var(--color-muted)]">{emailMsg}</p>}
          {emailDevLink && (
            <a href={emailDevLink} className="block break-all text-xs text-[var(--color-accent)]">
              {emailDevLink}
            </a>
          )}
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-accent)]/15 px-4 py-2 text-sm font-medium text-[var(--color-accent)]"
          >
            Solicitar troca de e-mail
          </button>
        </form>
      </section>
    </div>
  )
}

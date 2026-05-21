import { isAdminEmail } from './admin.js'
import { verifyToken } from './auth.js'
import { readStore, writeStore } from './store.js'

async function requireAdmin(token) {
  const userId = await verifyToken(token)
  if (!userId) return null

  const store = await readStore()
  const user = store.users.find((u) => u.id === userId)
  if (!user || !isAdminEmail(user.email)) return null

  return { store, admin: user }
}

export async function handleAdminListUsers(token) {
  const ctx = await requireAdmin(token)
  if (!ctx) {
    return { status: 403, data: { error: 'Acesso restrito ao administrador' } }
  }

  const users = ctx.store.users
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name || '',
      createdAt: u.createdAt,
      emailVerified: u.emailVerified !== false,
      pendingEmail: u.pendingEmail || null,
      purchasesCount: (ctx.store.userData[u.id]?.purchases ?? []).length,
    }))
    .sort((a, b) => b.createdAt - a.createdAt)

  return { status: 200, data: { users, total: users.length } }
}

export async function handleAdminDeleteUser(token, targetUserId) {
  const ctx = await requireAdmin(token)
  if (!ctx) {
    return { status: 403, data: { error: 'Acesso restrito ao administrador' } }
  }

  if (!targetUserId) {
    return { status: 400, data: { error: 'ID do usuário obrigatório' } }
  }

  if (targetUserId === ctx.admin.id) {
    return { status: 400, data: { error: 'Você não pode remover sua própria conta de admin' } }
  }

  const idx = ctx.store.users.findIndex((u) => u.id === targetUserId)
  if (idx < 0) {
    return { status: 404, data: { error: 'Usuário não encontrado' } }
  }

  const removed = ctx.store.users[idx]
  ctx.store.users.splice(idx, 1)
  delete ctx.store.userData[targetUserId]
  await writeStore(ctx.store)

  return {
    status: 200,
    data: { message: `Conta ${removed.email} removida`, removedId: targetUserId },
  }
}

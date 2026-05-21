import { randomUUID } from 'crypto'
import { isAdminEmail } from './admin.js'
import {
  createVerificationToken,
  sendVerificationEmail,
  verificationExpiresAt,
} from './email.js'
import { hashPassword, signToken, verifyPassword, verifyToken } from './auth.js'
import { defaultUserData, readStore, writeStore } from './store.js'

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
}

function isEmailVerified(user) {
  return user.emailVerified !== false
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    createdAt: user.createdAt,
    emailVerified: isEmailVerified(user),
    isAdmin: isAdminEmail(user.email),
    pendingEmail: user.pendingEmail || null,
  }
}

async function findUserByToken(token) {
  const userId = await verifyToken(token)
  if (!userId) return null
  const store = await readStore()
  const user = store.users.find((u) => u.id === userId)
  if (!user) return null
  return { store, user, userId }
}

export async function handleRegister(body) {
  const email = normalizeEmail(body.email)
  const password = String(body.password || '').trim()
  const name = String(body.name || '').trim()

  if (!email || !email.includes('@')) {
    return { status: 400, data: { error: 'E-mail inválido' } }
  }
  if (password.length < 6) {
    return { status: 400, data: { error: 'Senha deve ter pelo menos 6 caracteres' } }
  }

  const store = await readStore()
  if (store.users.some((u) => u.email === email)) {
    return { status: 409, data: { error: 'Este e-mail já está cadastrado' } }
  }

  const verificationToken = createVerificationToken()
  const user = {
    id: randomUUID(),
    email,
    name,
    passwordHash: await hashPassword(password),
    createdAt: Date.now(),
    emailVerified: false,
    verificationToken,
    verificationTokenExpires: verificationExpiresAt(),
    pendingEmail: null,
  }

  store.users.push(user)
  store.userData[user.id] = defaultUserData()
  await writeStore(store)

  const mail = await sendVerificationEmail(email, verificationToken, 'register')

  return {
    status: 201,
    data: {
      needsVerification: true,
      message: mail.sent
        ? `Enviamos um e-mail de confirmação para ${email}. Abra o link para ativar sua conta.`
        : `Conta criada. Configure SMTP para envio automático ou use o link abaixo (modo desenvolvimento).`,
      email,
      devVerifyLink: mail.devLink || null,
    },
  }
}

export async function handleLogin(body) {
  const email = normalizeEmail(body.email)
  const password = String(body.password || '').trim()

  const store = await readStore()
  const user = store.users.find((u) => u.email === email)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { status: 401, data: { error: 'E-mail ou senha incorretos' } }
  }

  if (!isEmailVerified(user)) {
    return {
      status: 403,
      data: {
        error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
        needsVerification: true,
        email: user.email,
      },
    }
  }

  const token = await signToken(user.id)
  return {
    status: 200,
    data: { token, user: publicUser(user) },
  }
}

export async function handleVerifyEmail(query) {
  const token = String(query.token || '').trim()
  if (!token) {
    return { status: 400, data: { error: 'Token inválido' } }
  }

  const store = await readStore()
  const user = store.users.find(
    (u) =>
      u.verificationToken === token ||
      (u.pendingEmail && u.verificationToken === token),
  )

  if (!user) {
    return { status: 400, data: { error: 'Link inválido ou já utilizado' } }
  }

  if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now()) {
    return { status: 400, data: { error: 'Link expirado. Solicite um novo e-mail.' } }
  }

  if (user.pendingEmail && user.verificationToken === token) {
    const newEmail = normalizeEmail(user.pendingEmail)
    if (store.users.some((u) => u.id !== user.id && u.email === newEmail)) {
      return { status: 409, data: { error: 'Este e-mail já está em uso' } }
    }
    user.email = newEmail
    user.pendingEmail = null
  }

  user.emailVerified = true
  user.verificationToken = null
  user.verificationTokenExpires = null
  await writeStore(store)

  return {
    status: 200,
    data: {
      message: 'E-mail confirmado com sucesso! Você já pode entrar.',
      email: user.email,
    },
  }
}

export async function handleResendVerification(body) {
  const email = normalizeEmail(body.email)
  const store = await readStore()
  const user = store.users.find((u) => u.email === email)

  if (!user) {
    return { status: 200, data: { message: 'Se o e-mail existir, enviaremos um novo link.' } }
  }

  if (isEmailVerified(user)) {
    return { status: 400, data: { error: 'Este e-mail já foi confirmado' } }
  }

  user.verificationToken = createVerificationToken()
  user.verificationTokenExpires = verificationExpiresAt()
  await writeStore(store)

  const mail = await sendVerificationEmail(email, user.verificationToken, 'register')
  return {
    status: 200,
    data: {
      message: mail.sent ? 'Novo e-mail de confirmação enviado.' : 'Link gerado (modo dev).',
      devVerifyLink: mail.devLink || null,
    },
  }
}

export async function handleMe(token) {
  const ctx = await findUserByToken(token)
  if (!ctx) {
    return { status: 401, data: { error: 'Sessão expirada. Faça login novamente.' } }
  }

  const { store, user, userId } = ctx

  if (!store.userData[userId]) {
    store.userData[userId] = defaultUserData()
    await writeStore(store)
  }

  return {
    status: 200,
    data: {
      user: publicUser(user),
      data: store.userData[userId],
    },
  }
}

export async function handleSaveUserData(token, body) {
  const ctx = await findUserByToken(token)
  if (!ctx) {
    return { status: 401, data: { error: 'Não autorizado' } }
  }

  const { store, userId } = ctx
  const current = store.userData[userId] || defaultUserData()

  const next = {
    purchases: Array.isArray(body.purchases) ? body.purchases : current.purchases,
    favorites: Array.isArray(body.favorites) ? body.favorites : current.favorites,
    alerts: Array.isArray(body.alerts) ? body.alerts : current.alerts,
    alertHistory: Array.isArray(body.alertHistory) ? body.alertHistory : current.alertHistory,
    portfolioHistory: Array.isArray(body.portfolioHistory)
      ? body.portfolioHistory
      : current.portfolioHistory,
  }

  store.userData[userId] = next
  await writeStore(store)

  return { status: 200, data: { data: next } }
}

export async function handleChangePassword(token, body) {
  const ctx = await findUserByToken(token)
  if (!ctx) return { status: 401, data: { error: 'Não autorizado' } }

  const currentPassword = String(body.currentPassword || '')
  const newPassword = String(body.newPassword || '')

  if (newPassword.length < 6) {
    return { status: 400, data: { error: 'Nova senha deve ter pelo menos 6 caracteres' } }
  }

  const { user, store } = ctx
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return { status: 401, data: { error: 'Senha atual incorreta' } }
  }

  user.passwordHash = await hashPassword(newPassword)
  await writeStore(store)

  return { status: 200, data: { message: 'Senha alterada com sucesso' } }
}

export async function handleChangeEmail(token, body) {
  const ctx = await findUserByToken(token)
  if (!ctx) return { status: 401, data: { error: 'Não autorizado' } }

  const newEmail = normalizeEmail(body.newEmail)
  const password = String(body.password || '')

  if (!newEmail || !newEmail.includes('@')) {
    return { status: 400, data: { error: 'E-mail inválido' } }
  }

  const { user, store } = ctx
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { status: 401, data: { error: 'Senha incorreta' } }
  }

  if (newEmail === user.email) {
    return { status: 400, data: { error: 'Este já é seu e-mail atual' } }
  }

  if (store.users.some((u) => u.id !== user.id && u.email === newEmail)) {
    return { status: 409, data: { error: 'Este e-mail já está cadastrado' } }
  }

  const verificationToken = createVerificationToken()
  user.pendingEmail = newEmail
  user.verificationToken = verificationToken
  user.verificationTokenExpires = verificationExpiresAt()
  await writeStore(store)

  const mail = await sendVerificationEmail(newEmail, verificationToken, 'email-change')

  return {
    status: 200,
    data: {
      message: mail.sent
        ? `Enviamos confirmação para ${newEmail}. O e-mail antigo permanece até você confirmar.`
        : 'Confirme pelo link (modo desenvolvimento).',
      pendingEmail: newEmail,
      devVerifyLink: mail.devLink || null,
    },
  }
}

export async function handleUpdateProfile(token, body) {
  const ctx = await findUserByToken(token)
  if (!ctx) return { status: 401, data: { error: 'Não autorizado' } }

  const { user, store } = ctx
  user.name = String(body.name || '').trim()
  await writeStore(store)

  return { status: 200, data: { user: publicUser(user) } }
}

/** Só funciona se PASSWORD_RESET_KEY estiver definido no servidor (use na Vercel e remova depois). */
export async function handlePasswordResetWithKey(body) {
  const resetKey = process.env.PASSWORD_RESET_KEY
  if (!resetKey || resetKey.length < 16) {
    return { status: 404, data: { error: 'Não disponível' } }
  }

  const email = normalizeEmail(body.email)
  const password = String(body.password || '').trim()
  const key = String(body.resetKey || '').trim()

  if (key !== resetKey) {
    return { status: 403, data: { error: 'Chave inválida' } }
  }
  if (!email || !email.includes('@')) {
    return { status: 400, data: { error: 'E-mail inválido' } }
  }
  if (password.length < 6) {
    return { status: 400, data: { error: 'Senha deve ter pelo menos 6 caracteres' } }
  }

  const store = await readStore()
  const user = store.users.find((u) => u.email === email)
  if (!user) {
    return { status: 404, data: { error: 'Usuário não encontrado neste servidor' } }
  }

  user.passwordHash = await hashPassword(password)
  user.emailVerified = true
  delete user.verificationToken
  delete user.verificationTokenExpires
  await writeStore(store)

  return { status: 200, data: { message: 'Senha atualizada. Faça login com a senha nova.' } }
}

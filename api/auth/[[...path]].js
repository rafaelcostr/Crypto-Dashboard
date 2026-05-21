import { getBearerToken, parseJsonBody } from '../lib/auth.js'
import {
  handleChangeEmail,
  handleChangePassword,
  handleLogin,
  handleMe,
  handleRegister,
  handleResendVerification,
  handleUpdateProfile,
  handleVerifyEmail,
} from '../lib/authHandlers.js'

function authRoute(req) {
  const segments = req.query.path
  if (Array.isArray(segments) && segments.length) return segments.join('/')
  if (typeof segments === 'string' && segments) return segments
  const match = (req.url || '').match(/\/api\/auth\/([^?]*)/)
  return match?.[1] ? decodeURIComponent(match[1]) : ''
}

function setCors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', methods)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  const route = authRoute(req)

  if (req.method === 'OPTIONS') {
    setCors(res, 'GET, POST, OPTIONS')
    return res.status(200).end()
  }

  try {
    if (route === 'register' && req.method === 'POST') {
      setCors(res, 'POST, OPTIONS')
      const result = await handleRegister(await parseJsonBody(req))
      return res.status(result.status).json(result.data)
    }

    if (route === 'login' && req.method === 'POST') {
      setCors(res, 'POST, OPTIONS')
      const result = await handleLogin(await parseJsonBody(req))
      return res.status(result.status).json(result.data)
    }

    if (route === 'me' && req.method === 'GET') {
      setCors(res, 'GET, OPTIONS')
      const token = getBearerToken(req)
      if (!token) return res.status(401).json({ error: 'Token ausente' })
      const result = await handleMe(token)
      return res.status(result.status).json(result.data)
    }

    if (route === 'verify-email' && req.method === 'GET') {
      setCors(res, 'GET, OPTIONS')
      const result = await handleVerifyEmail(req.query)
      return res.status(result.status).json(result.data)
    }

    if (route === 'resend-verification' && req.method === 'POST') {
      setCors(res, 'POST, OPTIONS')
      const result = await handleResendVerification(await parseJsonBody(req))
      return res.status(result.status).json(result.data)
    }

    if (route === 'change-password' && req.method === 'POST') {
      setCors(res, 'POST, OPTIONS')
      const token = getBearerToken(req)
      if (!token) return res.status(401).json({ error: 'Não autorizado' })
      const result = await handleChangePassword(token, await parseJsonBody(req))
      return res.status(result.status).json(result.data)
    }

    if (route === 'change-email' && req.method === 'POST') {
      setCors(res, 'POST, OPTIONS')
      const token = getBearerToken(req)
      if (!token) return res.status(401).json({ error: 'Não autorizado' })
      const result = await handleChangeEmail(token, await parseJsonBody(req))
      return res.status(result.status).json(result.data)
    }

    if (route === 'update-profile' && req.method === 'POST') {
      setCors(res, 'POST, OPTIONS')
      const token = getBearerToken(req)
      if (!token) return res.status(401).json({ error: 'Não autorizado' })
      const result = await handleUpdateProfile(token, await parseJsonBody(req))
      return res.status(result.status).json(result.data)
    }

    return res.status(404).json({ error: 'Rota não encontrada' })
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro',
    })
  }
}

import {
  handleChangeEmail,
  handleChangePassword,
  handleLogin,
  handleMe,
  handleRegister,
  handlePasswordResetWithKey,
  handleResendVerification,
  handleSaveUserData,
  handleUpdateProfile,
  handleVerifyEmail,
} from '../api/lib/authHandlers.js'
import { handleAdminDeleteUser, handleAdminListUsers } from '../api/lib/adminHandlers.js'

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(JSON.stringify(data))
}

function getBearer(req) {
  const auth = req.headers.authorization || ''
  return auth.startsWith('Bearer ') ? auth.slice(7) : ''
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        reject(new Error('JSON inválido'))
      }
    })
    req.on('error', reject)
  })
}

function parseQuery(url) {
  const i = url.indexOf('?')
  if (i < 0) return {}
  const params = new URLSearchParams(url.slice(i + 1))
  const q = {}
  for (const [k, v] of params) q[k] = v
  return q
}

const AUTH_PREFIXES = ['/api/auth/', '/api/user/data', '/api/admin/']

export function createAuthDevMiddleware() {
  return async function authDevMiddleware(req, res, next) {
    const fullUrl = req.url || ''
    const path = fullUrl.split('?')[0]
    if (!AUTH_PREFIXES.some((p) => path.startsWith(p) || path === p)) return next()

    if (req.method === 'OPTIONS') {
      res.statusCode = 200
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.end()
      return
    }

    const token = getBearer(req)
    const query = parseQuery(fullUrl)

    try {
      if (path === '/api/auth/register' && req.method === 'POST') {
        const result = await handleRegister(await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/login' && req.method === 'POST') {
        const result = await handleLogin(await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/me' && req.method === 'GET') {
        const result = await handleMe(token)
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/verify-email' && req.method === 'GET') {
        const result = await handleVerifyEmail(query)
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/resend-verification' && req.method === 'POST') {
        const result = await handleResendVerification(await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/change-password' && req.method === 'POST') {
        const result = await handleChangePassword(token, await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/change-email' && req.method === 'POST') {
        const result = await handleChangeEmail(token, await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/update-profile' && req.method === 'POST') {
        const result = await handleUpdateProfile(token, await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/auth/reset-password-key' && req.method === 'POST') {
        const result = await handlePasswordResetWithKey(await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/user/data' && req.method === 'PUT') {
        const result = await handleSaveUserData(token, await readBody(req))
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/admin/users' && req.method === 'GET') {
        const result = await handleAdminListUsers(token)
        sendJson(res, result.status, result.data)
        return
      }
      if (path === '/api/admin/users' && req.method === 'DELETE') {
        const body = await readBody(req)
        const result = await handleAdminDeleteUser(token, query.userId || body.userId)
        sendJson(res, result.status, result.data)
        return
      }

      sendJson(res, 405, { error: 'Método não permitido' })
    } catch (e) {
      sendJson(res, 500, {
        error: e instanceof Error ? e.message : 'Erro no servidor',
      })
    }
  }
}

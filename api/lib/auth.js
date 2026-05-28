import bcrypt from 'bcryptjs'
import * as jose from 'jose'

const JWT_SECRET = process.env.AUTH_JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'AUTH_JWT_SECRET must be configured and contain at least 32 characters.',
  )
}

function getJwtSecret() {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export async function signToken(userId) {
  return new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getJwtSecret())
}

export async function verifyToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret())
    const sub = payload.sub
    return typeof sub === 'string' ? sub : null
  } catch {
    return null
  }
}

export function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization
  if (!header || typeof header !== 'string') return null
  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) return null
  return token.trim()
}

export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body)
      return
    }
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

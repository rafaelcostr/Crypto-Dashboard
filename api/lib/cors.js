function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/$/, '')
}

function getAllowedOrigins() {
  const env = String(process.env.ALLOWED_ORIGIN || process.env.ALLOWED_ORIGINS || process.env.APP_URL || '').trim()
  const origins = env
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

  if (origins.length > 0) {
    return origins
  }

  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:5173', 'http://127.0.0.1:5173']
  }

  return []
}

function getRequestOrigin(req) {
  const origin = req.headers.origin || req.headers.Origin
  return typeof origin === 'string' ? normalizeOrigin(origin) : null
}

export function isOriginAllowed(origin) {
  if (!origin) return false
  const allowed = getAllowedOrigins()
  return allowed.includes('*') || allowed.includes(origin)
}

export function setCors(res, methods, req) {
  const origin = getRequestOrigin(req)
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', methods)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function requireCors(req, res, methods) {
  setCors(res, methods, req)
  const origin = getRequestOrigin(req)
  if (origin && !isOriginAllowed(origin)) {
    res.status(403).json({ error: 'Origem não autorizada' })
    return false
  }
  return true
}

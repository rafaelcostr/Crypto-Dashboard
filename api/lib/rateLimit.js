const requests = new Map()
const DEFAULT_WINDOW_MS = 60 * 1000

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

export function enforceRateLimit(req, res, route, limit = 10, windowMs = DEFAULT_WINDOW_MS) {
  const ip = getClientIp(req)
  const key = `${route}:${ip}`
  const now = Date.now()
  const entry = requests.get(key) || { count: 0, expiresAt: now + windowMs }

  if (entry.expiresAt <= now) {
    entry.count = 0
    entry.expiresAt = now + windowMs
  }

  entry.count += 1
  requests.set(key, entry)

  if (entry.count > limit) {
    res.setHeader('Retry-After', String(Math.ceil((entry.expiresAt - now) / 1000)))
    res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' })
    return false
  }

  return true
}

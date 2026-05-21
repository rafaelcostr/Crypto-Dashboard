function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((e) => normalizeEmail(e))
    .filter(Boolean)
}

export function isAdminEmail(email) {
  const admins = getAdminEmails()
  if (admins.length === 0) return false
  return admins.includes(normalizeEmail(email))
}

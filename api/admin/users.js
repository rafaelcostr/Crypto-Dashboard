import { getBearerToken, parseJsonBody } from '../lib/auth.js'
import { handleAdminDeleteUser, handleAdminListUsers } from '../lib/adminHandlers.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Não autorizado' })

  try {
    if (req.method === 'GET') {
      const result = await handleAdminListUsers(token)
      return res.status(result.status).json(result.data)
    }

    if (req.method === 'DELETE') {
      const userId = req.query.userId || (await parseJsonBody(req)).userId
      const result = await handleAdminDeleteUser(token, userId)
      return res.status(result.status).json(result.data)
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Erro' })
  }
}

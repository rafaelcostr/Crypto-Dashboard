import { getBearerToken } from '../lib/auth.js'
import { handleMe } from '../lib/authHandlers.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Token ausente' })

  try {
    const result = await handleMe(token)
    return res.status(result.status).json(result.data)
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro ao carregar sessão',
    })
  }
}

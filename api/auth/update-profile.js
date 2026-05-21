import { getBearerToken, parseJsonBody } from '../lib/auth.js'
import { handleUpdateProfile } from '../lib/authHandlers.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Não autorizado' })

  try {
    const body = await parseJsonBody(req)
    const result = await handleUpdateProfile(token, body)
    return res.status(result.status).json(result.data)
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Erro' })
  }
}

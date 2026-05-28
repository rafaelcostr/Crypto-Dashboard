import { getBearerToken, parseJsonBody } from '../lib/auth.js'
import { requireCors } from '../lib/cors.js'
import { handleSaveUserData } from '../lib/authHandlers.js'

export default async function handler(req, res) {
  if (!requireCors(req, res, 'PUT, OPTIONS')) return
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Método não permitido' })

  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Token ausente' })

  try {
    const body = await parseJsonBody(req)
    const result = await handleSaveUserData(token, body)
    return res.status(result.status).json(result.data)
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro ao salvar dados',
    })
  }
}

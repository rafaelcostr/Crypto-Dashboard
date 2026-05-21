import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_STORE = {
  users: [],
  userData: {},
}

/** Caminho gravável: local = data/ ; Vercel = /tmp (filesystem do deploy é read-only). */
function resolveStoreFile() {
  if (process.env.AUTH_STORE_PATH) {
    return process.env.AUTH_STORE_PATH
  }
  if (process.env.VERCEL) {
    return '/tmp/crypto-dashboard-auth-store.json'
  }
  return path.join(__dirname, '../../data/auth-store.json')
}

function getStoreFile() {
  return resolveStoreFile()
}

export async function readStore() {
  const storeFile = getStoreFile()
  const dataDir = path.dirname(storeFile)
  try {
    await fs.mkdir(dataDir, { recursive: true })
    const raw = await fs.readFile(storeFile, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      userData: parsed.userData && typeof parsed.userData === 'object' ? parsed.userData : {},
    }
  } catch {
    return structuredClone(DEFAULT_STORE)
  }
}

export async function writeStore(store) {
  const storeFile = getStoreFile()
  const dataDir = path.dirname(storeFile)
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8')
}

export function defaultUserData() {
  return {
    purchases: [],
    favorites: [],
    alerts: [],
    alertHistory: [],
    portfolioHistory: [],
  }
}

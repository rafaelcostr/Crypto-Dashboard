import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../../data')
const STORE_FILE = path.join(DATA_DIR, 'auth-store.json')

const DEFAULT_STORE = {
  users: [],
  userData: {},
}

export async function readStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(STORE_FILE, 'utf8')
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
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8')
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

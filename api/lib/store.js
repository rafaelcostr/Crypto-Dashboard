import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_STORE = {
  users: [],
  userData: {},
}

/**
 * Storage selection:
 * - If `AUTH_STORE_DB` is set, use SQLite (file path or :memory:)
 * - Otherwise use file-system JSON at `data/auth-store.json` or `/tmp` on Vercel
 */
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

let sqliteDb = null
function getSqliteDb() {
  if (sqliteDb) return sqliteDb
  const dbPath = process.env.AUTH_STORE_DB || ''
  if (!dbPath) return null
  // lazy require to avoid requiring native module when not used
  let Database
  try {
    // eslint-disable-next-line node/no-missing-require
    Database = require('better-sqlite3')
  } catch (e) {
    // better-sqlite3 not installed; fall back to JSON storage
    // avoid throwing here so app can run without native dependency
    // console.warn is intentional to inform deployers
    // eslint-disable-next-line no-console
    console.warn('better-sqlite3 not available — falling back to file-based auth store')
    return null
  }
  const resolved = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath)
  const dir = path.dirname(resolved)
  // ensure dir exists
  try {
    fs.mkdir(dir, { recursive: true }).catch(() => {})
  } catch (e) {
    // ignore
  }
  sqliteDb = new Database(resolved)
  // legacy kv table (keeps backward compatibility)
  sqliteDb.prepare('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)').run()
  // normalized schema
  sqliteDb
    .prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        passwordHash TEXT,
        createdAt INTEGER,
        emailVerified INTEGER,
        verificationToken TEXT,
        verificationTokenExpires INTEGER,
        pendingEmail TEXT
      )`,
    )
    .run()
  sqliteDb.prepare('CREATE TABLE IF NOT EXISTS user_data (user_id TEXT PRIMARY KEY, data TEXT NOT NULL)').run()
  return sqliteDb
}

export async function readStore() {
  const db = getSqliteDb()
  if (db) {
    try {
      // If legacy kv store exists, prefer it for compatibility
      try {
        const kvRow = db.prepare('SELECT v FROM kv WHERE k = ?').get('store')
        if (kvRow && kvRow.v) {
          const parsed = JSON.parse(kvRow.v)
          return {
            users: Array.isArray(parsed.users) ? parsed.users : [],
            userData: parsed.userData && typeof parsed.userData === 'object' ? parsed.userData : {},
          }
        }
      } catch (e) {
        // continue to normalized schema
      }

      // Read normalized users
      const userRows = db.prepare('SELECT * FROM users').all()
      const users = userRows.map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        passwordHash: r.passwordHash,
        createdAt: Number(r.createdAt) || Date.now(),
        emailVerified: r.emailVerified === 1,
        verificationToken: r.verificationToken || null,
        verificationTokenExpires: r.verificationTokenExpires || null,
        pendingEmail: r.pendingEmail || null,
      }))

      const dataRows = db.prepare('SELECT user_id, data FROM user_data').all()
      const userData = {}
      for (const row of dataRows) {
        try {
          userData[row.user_id] = JSON.parse(row.data)
        } catch {
          userData[row.user_id] = {}
        }
      }

      // If DB is empty, attempt migration from JSON file
      if (users.length === 0) {
        const storeFile = getStoreFile()
        try {
          await fs.access(storeFile)
          const raw = await fs.readFile(storeFile, 'utf8')
          const parsed = JSON.parse(raw)
          const legacyUsers = Array.isArray(parsed.users) ? parsed.users : []
          const legacyUserData = parsed.userData && typeof parsed.userData === 'object' ? parsed.userData : {}

          if (legacyUsers.length > 0) {
            const insertUser = db.prepare(
              'INSERT OR REPLACE INTO users (id,email,name,passwordHash,createdAt,emailVerified,verificationToken,verificationTokenExpires,pendingEmail) VALUES (?,?,?,?,?,?,?,?,?)'
            )
            const insertData = db.prepare('INSERT OR REPLACE INTO user_data (user_id, data) VALUES (?, ?)')
            const tx = db.transaction(() => {
              for (const u of legacyUsers) {
                insertUser.run(
                  u.id,
                  u.email,
                  u.name || '',
                  u.passwordHash || '',
                  Number(u.createdAt) || Date.now(),
                  u.emailVerified ? 1 : 0,
                  u.verificationToken || null,
                  u.verificationTokenExpires || null,
                  u.pendingEmail || null,
                )
              }
              for (const [uid, data] of Object.entries(legacyUserData)) {
                insertData.run(uid, JSON.stringify(data || {}))
              }
            })
            tx()
            // reload
            const migratedUsers = db.prepare('SELECT * FROM users').all()
            const migratedDataRows = db.prepare('SELECT user_id, data FROM user_data').all()
            const migratedUserData = {}
            for (const row of migratedDataRows) {
              try {
                migratedUserData[row.user_id] = JSON.parse(row.data)
              } catch {
                migratedUserData[row.user_id] = {}
              }
            }
            return { users: migratedUsers.map((r) => ({
              id: r.id,
              email: r.email,
              name: r.name,
              passwordHash: r.passwordHash,
              createdAt: Number(r.createdAt) || Date.now(),
              emailVerified: r.emailVerified === 1,
              verificationToken: r.verificationToken || null,
              verificationTokenExpires: r.verificationTokenExpires || null,
              pendingEmail: r.pendingEmail || null,
            })), userData: migratedUserData }
          }
        } catch (e) {
          // no legacy file or failed to migrate
        }
      }

      return { users, userData }
    } catch (e) {
      return structuredClone(DEFAULT_STORE)
    }
  }

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
  const db = getSqliteDb()
  if (db) {
    try {
      // Write normalized tables in a transaction
      const insertUser = db.prepare(
        'INSERT OR REPLACE INTO users (id,email,name,passwordHash,createdAt,emailVerified,verificationToken,verificationTokenExpires,pendingEmail) VALUES (?,?,?,?,?,?,?,?,?)'
      )
      const insertData = db.prepare('INSERT OR REPLACE INTO user_data (user_id, data) VALUES (?, ?)')
      const clearUsers = db.prepare('DELETE FROM users')
      const clearData = db.prepare('DELETE FROM user_data')
      const tx = db.transaction((s) => {
        clearUsers.run()
        clearData.run()
        for (const u of s.users || []) {
          insertUser.run(
            u.id,
            u.email,
            u.name || '',
            u.passwordHash || '',
            Number(u.createdAt) || Date.now(),
            u.emailVerified ? 1 : 0,
            u.verificationToken || null,
            u.verificationTokenExpires || null,
            u.pendingEmail || null,
          )
        }
        const ud = s.userData || {}
        for (const [uid, data] of Object.entries(ud)) {
          insertData.run(uid, JSON.stringify(data || {}))
        }
      })
      tx(store)
      return
    } catch (e) {
      // fallback to file
    }
  }

  const storeFile = getStoreFile()
  const dataDir = path.dirname(storeFile)
  await fs.mkdir(dataDir, { recursive: true })
  const tmpFile = `${storeFile}.${Date.now()}.tmp`
  const content = JSON.stringify(store, null, 2)
  await fs.writeFile(tmpFile, content, 'utf8')
  await fs.rename(tmpFile, storeFile)
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

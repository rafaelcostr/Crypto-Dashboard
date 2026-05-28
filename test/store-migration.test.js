import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

// Mock better-sqlite3 before importing the store module
vi.mock('better-sqlite3', () => {
  return {
    default: undefined,
    // export the class as module.exports
    __esModule: true,
    // The class
    defaultExport: undefined,
  }
}, { virtual: true })

// Provide a dynamic mock by overriding require cache later

// Implement a lightweight in-memory sqlite shim
class MockDatabase {
  constructor(file) {
    this.file = file
    this.kv = new Map()
    this.users = new Map()
    this.user_data = new Map()
  }

  prepare(sql) {
    const s = sql.trim().toLowerCase()
    if (s.startsWith('select v from kv where')) {
      return {
        get: (k) => {
          const v = this.kv.get(k)
          return v ? { v } : undefined
        },
      }
    }
    if (s.startsWith('insert or replace into kv')) {
      return {
        run: (k, v) => {
          this.kv.set(k, v)
        },
      }
    }
    if (s.startsWith('select * from users')) {
      return {
        all: () => Array.from(this.users.values()),
      }
    }
    if (s.startsWith('select user_id, data from user_data')) {
      return {
        all: () => Array.from(this.user_data.entries()).map(([user_id, data]) => ({ user_id, data })),
      }
    }
    if (s.startsWith('insert or replace into users')) {
      return {
        run: (id, email, name, passwordHash, createdAt, emailVerified, verificationToken, verificationTokenExpires, pendingEmail) => {
          this.users.set(id, {
            id,
            email,
            name,
            passwordHash,
            createdAt,
            emailVerified,
            verificationToken,
            verificationTokenExpires,
            pendingEmail,
          })
        },
      }
    }
    if (s.startsWith('insert or replace into user_data')) {
      return {
        run: (id, data) => {
          this.user_data.set(id, data)
        },
      }
    }
    if (s.startsWith('delete from users')) {
      return { run: () => this.users.clear() }
    }
    if (s.startsWith('delete from user_data')) {
      return { run: () => this.user_data.clear() }
    }
    // create table or other statements
    return { run: () => {} }
  }

  transaction(cb) {
    return (...args) => cb(...args)
  }
}

// Replace the virtual module with our mock class when required
vi.mock('better-sqlite3', () => {
  return MockDatabase
})

let tmpDir
beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(process.cwd(), 'tmp-store-'))
})

afterEach(async () => {
  // remove tmp dir
  try {
    await fs.rm(tmpDir, { recursive: true, force: true })
  } catch (e) {}
})

describe('JSON -> SQLite migration', () => {
  it('migrates legacy JSON file into SQLite normalized schema', async () => {
    // prepare legacy store file
    const legacy = {
      users: [
        {
          id: 'u1',
          email: 'me@example.com',
          name: 'Me',
          passwordHash: 'hash',
          createdAt: Date.now(),
          emailVerified: true,
        },
      ],
      userData: {
        u1: { purchases: [{ coin: 'btc', qty: 1 }] },
      },
    }

    const storeFile = path.join(tmpDir, 'auth-store.json')
    await fs.writeFile(storeFile, JSON.stringify(legacy, null, 2), 'utf8')

    // set env to use sqlite db and point store file resolution to tmp
    process.env.AUTH_STORE_DB = path.join(tmpDir, 'auth.db')
    process.env.AUTH_STORE_PATH = storeFile

    // import the store module (fresh)
    const { readStore, writeStore } = await import('../api/lib/store.js')

    const s = await readStore()
    expect(Array.isArray(s.users)).toBe(true)
    expect(s.users.length).toBe(1)
    expect(s.users[0].email).toBe('me@example.com')
    expect(s.userData.u1).toBeTruthy()
    expect(s.userData.u1.purchases[0].coin).toBe('btc')

    // modify and write back
    s.userData.u1.purchases.push({ coin: 'eth', qty: 2 })
    await writeStore(s)

    // read again to ensure write persisted in mock DB
    const s2 = await readStore()
    expect(s2.userData.u1.purchases.find(p => p.coin === 'eth')).toBeTruthy()
  })
})

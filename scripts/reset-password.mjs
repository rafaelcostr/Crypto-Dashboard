/**
 * Redefine senha local (data/auth-store.json).
 * Uso: node scripts/reset-password.mjs seu@email.com NovaSenha123
 */
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.join(__dirname, '../data/auth-store.json')

const email = String(process.argv[2] || '')
  .trim()
  .toLowerCase()
const password = String(process.argv[3] || '').trim()

if (!email || !email.includes('@')) {
  console.error('Uso: node scripts/reset-password.mjs seu@email.com NovaSenha123')
  process.exit(1)
}
if (password.length < 6) {
  console.error('A senha precisa ter pelo menos 6 caracteres.')
  process.exit(1)
}

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'))
const user = store.users.find((u) => u.email === email)
if (!user) {
  console.error(`Usuário não encontrado: ${email}`)
  process.exit(1)
}

user.passwordHash = bcrypt.hashSync(password, 10)
if (user.emailVerified === false) {
  user.emailVerified = true
  delete user.verificationToken
  delete user.verificationTokenExpires
}
fs.writeFileSync(storePath, JSON.stringify(store, null, 2))
console.log(`Senha atualizada para ${email}`)
console.log('Entre no login com a senha que você acabou de definir.')

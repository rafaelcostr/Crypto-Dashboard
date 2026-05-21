import nodemailer from 'nodemailer'
import { randomUUID } from 'crypto'

export function createVerificationToken() {
  return randomUUID()
}

export function verificationExpiresAt() {
  return Date.now() + 24 * 60 * 60 * 1000
}

function getAppBaseUrl() {
  const explicit = process.env.APP_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  // Vercel define VERCEL_URL automaticamente (ex.: crypto-dashboard-xxx.vercel.app)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '')
  }
  return 'http://localhost:5173'
}

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 587)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(to, token, type = 'register') {
  const link = `${getAppBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`
  const subject =
    type === 'email-change'
      ? 'Confirme seu novo e-mail — Crypto Dashboard'
      : 'Confirme seu cadastro — Crypto Dashboard'

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#00d4aa">Crypto Dashboard</h2>
      <p>${type === 'email-change' ? 'Você solicitou alteração de e-mail.' : 'Obrigado por criar sua conta!'}</p>
      <p>Clique no botão abaixo para confirmar (válido por 24 horas):</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#00d4aa;color:#0a0e17;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          Confirmar e-mail
        </a>
      </p>
      <p style="font-size:12px;color:#666">Ou copie o link:<br/><a href="${link}">${link}</a></p>
    </div>
  `

  if (!isSmtpConfigured()) {
    console.log(`[Crypto Dashboard] E-mail não configurado. Link de verificação para ${to}:`)
    console.log(link)
    return { sent: false, devLink: link }
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  await createTransport().sendMail({ from, to, subject, html })
  return { sent: true }
}

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

const router = express.Router()

// Rate limit specifico per il login: max 5 tentativi ogni 15 minuti
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Troppi tentativi di accesso. Riprova tra 15 minuti.' },
  standardHeaders: true,
  legacyHeaders: false
})

// User model
const User = sequelize.define('User', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  ruolo: { type: DataTypes.STRING, defaultValue: 'consulente' },
  refreshToken: { type: DataTypes.TEXT, defaultValue: null },
  totpSecret: { type: DataTypes.STRING, defaultValue: null },
  totpEnabled: { type: DataTypes.BOOLEAN, defaultValue: false }
})

User.sync({ force: false })

// Genera access token (1 ora)
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'crmlentini_secret_2024', { expiresIn: '1h' })
}

// Genera refresh token (7 giorni)
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'crmlentini_refresh_2024', { expiresIn: '7d' })
}

// Middleware auth
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Token mancante' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crmlentini_secret_2024')
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Token non valido o scaduto' })
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nome, email, password } = req.body
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ message: 'Email gia registrata' })
    const hash = await bcrypt.hash(password, 12)
    const user = await User.create({ nome, email, password: hash })
    const payload = { id: user.id, email: user.email, ruolo: user.ruolo }
    const token = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    await user.update({ refreshToken })
    res.status(201).json({ token, refreshToken, user: { id: user.id, nome: user.nome, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: 'Errore nella registrazione' })
  }
})

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, totpToken } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Credenziali non valide' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Credenziali non valide' })

    // Verifica 2FA se abilitato
    if (user.totpEnabled) {
      if (!totpToken) {
        return res.status(200).json({ requires2FA: true, message: 'Inserisci il codice Authenticator' })
      }
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: totpToken,
        window: 1
      })
      if (!verified) return res.status(401).json({ message: 'Codice Authenticator non valido' })
    }

    const payload = { id: user.id, email: user.email, ruolo: user.ruolo }
    const token = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    await user.update({ refreshToken })
    res.json({ token, refreshToken, user: { id: user.id, nome: user.nome, email: user.email } })
  } catch {
    res.status(500).json({ message: 'Errore nel login' })
  }
})

// POST /api/auth/setup-2fa - Genera secret e QR code
router.post('/setup-2fa', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })

    const secret = speakeasy.generateSecret({
      name: `CRM Lentini (${user.email})`,
      length: 20
    })

    await user.update({ totpSecret: secret.base32 })

    const qrUrl = await qrcode.toDataURL(secret.otpauth_url)
    res.json({ qrCode: qrUrl, secret: secret.base32 })
  } catch (err) {
    res.status(500).json({ message: 'Errore nella configurazione 2FA' })
  }
})

// POST /api/auth/verify-2fa - Verifica il codice e abilita 2FA
router.post('/verify-2fa', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body
    const user = await User.findByPk(req.user.id)
    if (!user || !user.totpSecret) return res.status(400).json({ message: 'Prima avvia il setup 2FA' })

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token,
      window: 1
    })

    if (!verified) return res.status(400).json({ message: 'Codice non valido. Riprova.' })

    await user.update({ totpEnabled: true })
    res.json({ message: '2FA attivato con successo!' })
  } catch {
    res.status(500).json({ message: 'Errore nella verifica 2FA' })
  }
})

// POST /api/auth/disable-2fa - Disabilita 2FA
router.post('/disable-2fa', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })
    await user.update({ totpEnabled: false, totpSecret: null })
    res.json({ message: '2FA disabilitato' })
  } catch {
    res.status(500).json({ message: 'Errore nella disabilitazione 2FA' })
  }
})

// POST /api/auth/refresh - Rinnova access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token mancante' })
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'crmlentini_refresh_2024')
    const user = await User.findOne({ where: { id: decoded.id, refreshToken } })
    if (!user) return res.status(403).json({ message: 'Refresh token non valido' })
    const payload = { id: user.id, email: user.email, ruolo: user.ruolo }
    const newToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)
    await user.update({ refreshToken: newRefreshToken })
    res.json({ token: newToken, refreshToken: newRefreshToken })
  } catch {
    res.status(403).json({ message: 'Refresh token scaduto o non valido' })
  }
})

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await User.update({ refreshToken: null }, { where: { id: req.user.id } })
    res.json({ message: 'Logout effettuato' })
  } catch {
    res.status(500).json({ message: 'Errore nel logout' })
  }
})

// GET /api/auth/2fa-status - Verifica se il 2FA è abilitato per l'utente
router.get('/2fa-status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })
    res.json({ totpEnabled: user.totpEnabled })
  } catch {
    res.status(500).json({ message: 'Errore nel recupero stato 2FA' })
  }
})

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { passwordAttuale, nuovaPassword } = req.body
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })
    const valid = await bcrypt.compare(passwordAttuale, user.password)
    if (!valid) return res.status(401).json({ message: 'Password attuale non corretta' })
    if (!nuovaPassword || nuovaPassword.length < 6) {
      return res.status(400).json({ message: 'La nuova password deve avere almeno 6 caratteri' })
    }
    const hash = await bcrypt.hash(nuovaPassword, 12)
    await user.update({ password: hash })
    res.json({ message: 'Password aggiornata con successo' })
  } catch (err) {
    res.status(500).json({ message: 'Errore nel cambio password' })
  }
})

export default router

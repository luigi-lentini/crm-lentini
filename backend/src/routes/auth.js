import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'

const router = express.Router()

// User model
const User = sequelize.define('User', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  ruolo: { type: DataTypes.STRING, defaultValue: 'consulente' }
})

User.sync({ force: false })

// Middleware auth
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Token mancante' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crmlentini_secret_2024')
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Token non valido' })
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
    const token = jwt.sign({ id: user.id, email: user.email, ruolo: user.ruolo }, process.env.JWT_SECRET || 'crmlentini_secret_2024', { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user.id, nome: user.nome, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: 'Errore nella registrazione' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Credenziali non valide' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Credenziali non valide' })
    const token = jwt.sign({ id: user.id, email: user.email, ruolo: user.ruolo }, process.env.JWT_SECRET || 'crmlentini_secret_2024', { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } })
  } catch {
    res.status(500).json({ message: 'Errore nel login' })
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
    const hash = await bcrypt.hash(nuovaPassword, 12)
    await user.update({ password: hash })
    res.json({ message: 'Password aggiornata con successo' })
  } catch {
    res.status(500).json({ message: 'Errore nel cambio password' })
  }
})

export default router

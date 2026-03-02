import express from 'express'
import { DataTypes } from 'sequelize'
import { sequelize } from '../server.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

const Attivita = sequelize.define('Attivita', {
  titolo: { type: DataTypes.STRING, allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  scadenza: { type: DataTypes.DATEONLY },
  stato: { type: DataTypes.STRING, defaultValue: 'da_fare' },
  userId: { type: DataTypes.INTEGER }
})

Attivita.sync({ force: false })

// GET /api/attivita
router.get('/', authMiddleware, async (req, res) => {
  try {
    const attivita = await Attivita.findAll({ where: { userId: req.user.id }, order: [['scadenza', 'ASC']] })
    res.json(attivita)
  } catch {
    res.status(500).json({ message: 'Errore nel caricamento' })
  }
})

// GET /api/attivita/count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const count = await Attivita.count({ where: { userId: req.user.id, stato: 'da_fare' } })
    res.json({ count })
  } catch {
    res.status(500).json({ count: 0 })
  }
})

// GET /api/attivita/today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const count = await Attivita.count({ where: { userId: req.user.id, scadenza: today } })
    res.json({ count })
  } catch {
    res.status(500).json({ count: 0 })
  }
})

// POST /api/attivita
router.post('/', authMiddleware, async (req, res) => {
  try {
    const a = await Attivita.create({ ...req.body, userId: req.user.id })
    res.status(201).json(a)
  } catch {
    res.status(500).json({ message: 'Errore nella creazione' })
  }
})

// PUT /api/attivita/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const a = await Attivita.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!a) return res.status(404).json({ message: 'Attivita non trovata' })
    await a.update(req.body)
    res.json(a)
  } catch {
    res.status(500).json({ message: 'Errore nell aggiornamento' })
  }
})

// DELETE /api/attivita/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const a = await Attivita.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!a) return res.status(404).json({ message: 'Attivita non trovata' })
    await a.destroy()
    res.json({ message: 'Attivita eliminata' })
  } catch {
    res.status(500).json({ message: 'Errore nell eliminazione' })
  }
})

export default router

import express from 'express'
import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

const Trattativa = sequelize.define('Trattativa', {
  titolo: { type: DataTypes.STRING, allowNull: false },
  valore: { type: DataTypes.DECIMAL(15, 2) },
  fase: { type: DataTypes.STRING, defaultValue: 'contatto' },
  note: { type: DataTypes.TEXT },
  clienteId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER }
})

Trattativa.sync({ force: false })

router.get('/', authMiddleware, async (req, res) => {
  try {
    const trattative = await Trattativa.findAll({ where: { userId: req.user.id } })
    res.json(trattative)
  } catch {
    res.status(500).json({ message: 'Errore nel caricamento' })
  }
})

router.get('/count', authMiddleware, async (req, res) => {
  try {
    const count = await Trattativa.count({
      where: { userId: req.user.id }
    })
    res.json({ count })
  } catch {
    res.status(500).json({ count: 0 })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const t = await Trattativa.create({ ...req.body, userId: req.user.id })
    res.status(201).json(t)
  } catch {
    res.status(500).json({ message: 'Errore nella creazione' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const t = await Trattativa.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!t) return res.status(404).json({ message: 'Trattativa non trovata' })
    await t.update(req.body)
    res.json(t)
  } catch {
    res.status(500).json({ message: 'Errore aggiornamento' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const t = await Trattativa.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!t) return res.status(404).json({ message: 'Trattativa non trovata' })
    await t.destroy()
    res.json({ message: 'Trattativa eliminata' })
  } catch {
    res.status(500).json({ message: 'Errore eliminazione' })
  }
})

export default router

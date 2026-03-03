import express from 'express'
import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

const Cliente = sequelize.define('Cliente', {
  nome: { type: DataTypes.STRING, allowNull: false },
  cognome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  telefono: { type: DataTypes.STRING },
  note: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER }
})

Cliente.sync({ force: false })

// GET /api/clienti
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clienti = await Cliente.findAll({ where: { userId: req.user.id } })
    res.json(clienti)
  } catch {
    res.status(500).json({ message: 'Errore nel caricamento' })
  }
})

// GET /api/clienti/count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const count = await Cliente.count({ where: { userId: req.user.id } })
    res.json({ count })
  } catch {
    res.status(500).json({ count: 0 })
  }
})

// POST /api/clienti
router.post('/', authMiddleware, async (req, res) => {
  try {
    const c = await Cliente.create({ ...req.body, userId: req.user.id })
    res.status(201).json(c)
  } catch {
    res.status(500).json({ message: 'Errore nella creazione' })
  }
})

// POST /api/clienti/import - Import bulk da CSV
router.post('/import', authMiddleware, async (req, res) => {
  try {
    const { clienti } = req.body
    if (!Array.isArray(clienti) || clienti.length === 0) {
      return res.status(400).json({ message: 'Nessun dato da importare' })
    }
    const risultati = { importati: 0, saltati: 0, errori: [] }
    for (const c of clienti) {
      if (!c.nome || !c.cognome) {
        risultati.saltati++
        risultati.errori.push(`Riga saltata: nome o cognome mancante (${c.email || ''})`)
        continue
      }
      try {
        await Cliente.create({
          nome: c.nome || '',
          cognome: c.cognome || '',
          email: c.email || '',
          telefono: c.telefono || '',
          note: c.note || '',
          userId: req.user.id
        })
        risultati.importati++
      } catch {
        risultati.saltati++
        risultati.errori.push(`Errore importazione: ${c.email || c.nome}`)
      }
    }
    res.status(201).json(risultati)
  } catch {
    res.status(500).json({ message: 'Errore durante l\'importazione' })
  }
})

// PUT /api/clienti/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const c = await Cliente.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!c) return res.status(404).json({ message: 'Cliente non trovato' })
    await c.update(req.body)
    res.json(c)
  } catch {
    res.status(500).json({ message: 'Errore aggiornamento' })
  }
})

// DELETE /api/clienti/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const c = await Cliente.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!c) return res.status(404).json({ message: 'Cliente non trovato' })
    await c.destroy()
    res.json({ message: 'Cliente eliminato' })
  } catch {
    res.status(500).json({ message: 'Errore eliminazione' })
  }
})

export default router
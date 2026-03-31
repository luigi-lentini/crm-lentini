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
  indirizzo: { type: DataTypes.STRING },
  aum: { type: DataTypes.DECIMAL(15,2) },
  etichette: { type: DataTypes.TEXT, defaultValue: '[]' },
  ultimo_incontro: { type: DataTypes.DATEONLY },
  prossimo_incontro: { type: DataTypes.DATEONLY },
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

// GET /api/clienti/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const c = await Cliente.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!c) return res.status(404).json({ message: 'Cliente non trovato' })
    res.json(c)
  } catch {
    res.status(500).json({ message: 'Errore nel caricamento' })
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

// POST /api/clienti/import
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
        await Cliente.create({ nome: c.nome||'', cognome: c.cognome||'', email: c.email||'', telefono: c.telefono||'', note: c.note||'', userId: req.user.id })
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

    // GET /api/clienti/:id/note - Ottieni le note di un cliente
router.get('/:id/note', authMiddleware, async (req, res) => {
  try {
    const c = await Cliente.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!c) return res.status(404).json({ message: 'Cliente non trovato' })
    res.json({ note: c.note || '' })
  } catch {
    res.status(500).json({ message: 'Errore nel caricamento delle note' })
  }
})

// PUT /api/clienti/:id/note - Aggiorna le note di un cliente
router.put('/:id/note', authMiddleware, async (req, res) => {
  try {
    const c = await Cliente.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!c) return res.status(404).json({ message: 'Cliente non trovato' })
    await c.update({ note: req.body.note })
    res.json({ note: c.note })
  } catch {
    res.status(500).json({ message: 'Errore nell\'aggiornamento delle note' })
  }
})


export default router

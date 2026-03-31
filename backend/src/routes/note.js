import express from 'express'
import { sequelize } from '../db.js'
import { DataTypes } from 'sequelize'
import { authMiddleware } from './auth.js'

const router = express.Router()

// Modello Note
const Nota = sequelize.define('Nota', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  testo: { type: DataTypes.TEXT, allowNull: false },
  tipo: { type: DataTypes.STRING, defaultValue: 'generale' },
  data: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'note',
  timestamps: true
})

// Sincronizza tabella
Nota.sync()

// GET /api/note/cliente/:clienteId - Ottieni tutte le note di un cliente
router.get('/cliente/:clienteId', authMiddleware, async (req, res) => {
  try {
    const { clienteId } = req.params
    const note = await Nota.findAll({
      where: { cliente_id: clienteId },
      order: [['data', 'DESC']]
    })
    res.json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Errore nel recupero delle note' })
  }
})

// POST /api/note - Crea una nuova nota
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { cliente_id, testo, tipo } = req.body
    if (!cliente_id || !testo) {
      return res.status(400).json({ message: 'cliente_id e testo sono obbligatori' })
    }
    const nota = await Nota.create({
      cliente_id,
      user_id: req.user.id,
      testo,
      tipo: tipo || 'generale'
    })
    res.status(201).json(nota)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Errore nella creazione della nota' })
  }
})

// DELETE /api/note/:id - Elimina una nota
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const nota = await Nota.findOne({ where: { id, user_id: req.user.id } })
    if (!nota) {
      return res.status(404).json({ message: 'Nota non trovata' })
    }
    await nota.destroy()
    res.json({ message: 'Nota eliminata con successo' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Errore nell\'eliminazione della nota' })
  }
})

export default router

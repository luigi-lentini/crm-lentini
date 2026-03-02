import express from 'express'
import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

const Progetto = sequelize.define('Progetto', {
  nome: { type: DataTypes.STRING, allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  stato: { type: DataTypes.ENUM('attivo', 'completato', 'archiviato'), defaultValue: 'attivo' },
  colore: { type: DataTypes.STRING, defaultValue: '#3B82F6' },
  dataInizio: { type: DataTypes.DATE },
  dataFine: { type: DataTypes.DATE },
  userId: { type: DataTypes.INTEGER }
})

const KanbanCard = sequelize.define('KanbanCard', {
  progettoId: { type: DataTypes.INTEGER, allowNull: false },
  titolo: { type: DataTypes.STRING, allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  colonna: { type: DataTypes.ENUM('da_fare', 'in_corso', 'revisione', 'completato'), defaultValue: 'da_fare' },
  priorita: { type: DataTypes.ENUM('bassa', 'media', 'alta'), defaultValue: 'media' },
  scadenza: { type: DataTypes.DATE },
  assegnatoA: { type: DataTypes.STRING },
  ordine: { type: DataTypes.INTEGER, defaultValue: 0 },
  userId: { type: DataTypes.INTEGER }
})

Progetto.sync({ force: false })
KanbanCard.sync({ force: false })

router.use(authMiddleware)

// Progetti CRUD
router.get('/', async (req, res) => {
  try {
    const items = await Progetto.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] })
    res.json(items)
  } catch { res.status(500).json({ message: 'Errore recupero progetti' }) }
})

router.post('/', async (req, res) => {
  try {
    const item = await Progetto.create({ ...req.body, userId: req.user.id })
    res.status(201).json(item)
  } catch (e) { res.status(500).json({ message: 'Errore creazione', error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const item = await Progetto.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await item.update(req.body)
    res.json(item)
  } catch { res.status(500).json({ message: 'Errore aggiornamento' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const item = await Progetto.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await KanbanCard.destroy({ where: { progettoId: item.id } })
    await item.destroy()
    res.json({ message: 'Eliminato' })
  } catch { res.status(500).json({ message: 'Errore eliminazione' }) }
})

// Kanban Cards
router.get('/:progettoId/cards', async (req, res) => {
  try {
    const cards = await KanbanCard.findAll({ where: { progettoId: req.params.progettoId, userId: req.user.id }, order: [['ordine', 'ASC']] })
    res.json(cards)
  } catch { res.status(500).json({ message: 'Errore recupero cards' }) }
})

router.post('/:progettoId/cards', async (req, res) => {
  try {
    const card = await KanbanCard.create({ ...req.body, progettoId: req.params.progettoId, userId: req.user.id })
    res.status(201).json(card)
  } catch (e) { res.status(500).json({ message: 'Errore creazione card', error: e.message }) }
})

router.put('/cards/:cardId', async (req, res) => {
  try {
    const card = await KanbanCard.findOne({ where: { id: req.params.cardId, userId: req.user.id } })
    if (!card) return res.status(404).json({ message: 'Card non trovata' })
    await card.update(req.body)
    res.json(card)
  } catch { res.status(500).json({ message: 'Errore aggiornamento card' }) }
})

router.delete('/cards/:cardId', async (req, res) => {
  try {
    const card = await KanbanCard.findOne({ where: { id: req.params.cardId, userId: req.user.id } })
    if (!card) return res.status(404).json({ message: 'Card non trovata' })
    await card.destroy()
    res.json({ message: 'Card eliminata' })
  } catch { res.status(500).json({ message: 'Errore eliminazione card' }) }
})

export default router

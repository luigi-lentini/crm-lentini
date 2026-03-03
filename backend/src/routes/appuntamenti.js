import express from 'express'
import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

const Appuntamento = sequelize.define('Appuntamento', {
  titolo: { type: DataTypes.STRING, allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  dataInizio: { type: DataTypes.DATE, allowNull: false },
  dataFine: { type: DataTypes.DATE, allowNull: false },
  luogo: { type: DataTypes.STRING },
  tipo: { type: DataTypes.ENUM('meeting', 'call', 'visita', 'altro'), defaultValue: 'meeting' },
  stato: { type: DataTypes.ENUM('pianificato', 'completato', 'annullato'), defaultValue: 'pianificato' },
  clienteId: { type: DataTypes.INTEGER },
  clienteNome: { type: DataTypes.STRING },
  note: { type: DataTypes.TEXT },
  note_salienti: { type: DataTypes.TEXT },
  si_ripete: { type: DataTypes.STRING, defaultValue: 'No' },
  tutto_il_giorno: { type: DataTypes.BOOLEAN, defaultValue: false },
  appuntamento_online: { type: DataTypes.BOOLEAN, defaultValue: false },
  invia_email: { type: DataTypes.BOOLEAN, defaultValue: false },
  partecipanti: { type: DataTypes.TEXT, defaultValue: '[]' },
  indirizzo: { type: DataTypes.STRING },
  indirizzo_alternativo: { type: DataTypes.STRING },
  priorita: { type: DataTypes.ENUM('bassa', 'media', 'alta'), defaultValue: 'media' },
  userId: { type: DataTypes.INTEGER }
})

Appuntamento.sync({ force: false })

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const items = await Appuntamento.findAll({ where: { userId: req.user.id }, order: [['dataInizio', 'ASC']] })
    res.json(items)
  } catch { res.status(500).json({ message: 'Errore nel recupero appuntamenti' }) }
})

router.get('/:id', async (req, res) => {
  try {
    const item = await Appuntamento.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    res.json(item)
  } catch { res.status(500).json({ message: 'Errore nel recupero' }) }
})

router.post('/', async (req, res) => {
  try {
    const item = await Appuntamento.create({ ...req.body, userId: req.user.id })
    res.status(201).json(item)
  } catch (e) { res.status(500).json({ message: 'Errore nella creazione', error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const item = await Appuntamento.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await item.update(req.body)
    res.json(item)
  } catch { res.status(500).json({ message: 'Errore aggiornamento' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const item = await Appuntamento.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await item.destroy()
    res.json({ message: 'Eliminato' })
  } catch { res.status(500).json({ message: 'Errore eliminazione' }) }
})

export default router
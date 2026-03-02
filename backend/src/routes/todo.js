import express from 'express'
import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

const Todo = sequelize.define('Todo', {
  titolo: { type: DataTypes.STRING, allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  stato: { type: DataTypes.ENUM('da_fare', 'in_corso', 'completato'), defaultValue: 'da_fare' },
  priorita: { type: DataTypes.ENUM('bassa', 'media', 'alta', 'urgente'), defaultValue: 'media' },
  scadenza: { type: DataTypes.DATE },
  clienteId: { type: DataTypes.INTEGER },
  clienteNome: { type: DataTypes.STRING },
  categoria: { type: DataTypes.ENUM('chiamata', 'email', 'documento', 'meeting', 'follow_up', 'altro'), defaultValue: 'altro' },
  workflow: { type: DataTypes.JSON },
  note: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER }
})

Todo.sync({ force: false })

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const items = await Todo.findAll({ where: { userId: req.user.id }, order: [['scadenza', 'ASC'], ['priorita', 'DESC']] })
    res.json(items)
  } catch { res.status(500).json({ message: 'Errore recupero todo' }) }
})

router.post('/', async (req, res) => {
  try {
    const item = await Todo.create({ ...req.body, userId: req.user.id })
    res.status(201).json(item)
  } catch (e) { res.status(500).json({ message: 'Errore creazione', error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const item = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await item.update(req.body)
    res.json(item)
  } catch { res.status(500).json({ message: 'Errore aggiornamento' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const item = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await item.destroy()
    res.json({ message: 'Eliminato' })
  } catch { res.status(500).json({ message: 'Errore eliminazione' }) }
})

export default router

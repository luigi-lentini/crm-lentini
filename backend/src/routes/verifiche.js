import express from 'express'
import { DataTypes, Op } from 'sequelize'
import { sequelize } from '../db.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

const Verifica = sequelize.define('Verifica', {
  nome: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.ENUM('mifid', 'documento_identita', 'pac', 'polizza', 'mandato', 'altro'), defaultValue: 'altro' },
  clienteId: { type: DataTypes.INTEGER },
  clienteNome: { type: DataTypes.STRING },
  dataScadenza: { type: DataTypes.DATE, allowNull: false },
  giorniPreavviso: { type: DataTypes.INTEGER, defaultValue: 30 },
  azioneAutomatica: { type: DataTypes.ENUM('todo', 'promemoria', 'nessuna'), defaultValue: 'todo' },
  azioneEseguita: { type: DataTypes.BOOLEAN, defaultValue: false },
  note: { type: DataTypes.TEXT },
  stato: { type: DataTypes.ENUM('attiva', 'scaduta', 'rinnovata'), defaultValue: 'attiva' },
  userId: { type: DataTypes.INTEGER }
})

Verifica.sync({ force: false })

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const items = await Verifica.findAll({ where: { userId: req.user.id }, order: [['dataScadenza', 'ASC']] })
    res.json(items)
  } catch { res.status(500).json({ message: 'Errore recupero verifiche' }) }
})

// Scadenze imminenti (nei prossimi N giorni)
router.get('/alerts', async (req, res) => {
  try {
    const oggi = new Date()
    const items = await Verifica.findAll({
      where: {
        userId: req.user.id,
        stato: 'attiva',
        dataScadenza: {
          [Op.lte]: new Date(oggi.getTime() + 90 * 24 * 60 * 60 * 1000)
        }
      },
      order: [['dataScadenza', 'ASC']]
    })
    const alerts = items.map(v => {
      const giorni = Math.ceil((new Date(v.dataScadenza) - oggi) / (1000 * 60 * 60 * 24))
      return { ...v.toJSON(), giorniAllaScadenza: giorni, scaduta: giorni < 0 }
    })
    res.json(alerts)
  } catch { res.status(500).json({ message: 'Errore alerts' }) }
})

router.post('/', async (req, res) => {
  try {
    const item = await Verifica.create({ ...req.body, userId: req.user.id })
    res.status(201).json(item)
  } catch (e) { res.status(500).json({ message: 'Errore creazione', error: e.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const item = await Verifica.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await item.update(req.body)
    res.json(item)
  } catch { res.status(500).json({ message: 'Errore aggiornamento' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const item = await Verifica.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Non trovato' })
    await item.destroy()
    res.json({ message: 'Eliminato' })
  } catch { res.status(500).json({ message: 'Errore eliminazione' }) }
})

export default router

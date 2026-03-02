import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { sequelize } from './db.js'

import authRoutes from './routes/auth.js'
import clientiRoutes from './routes/clienti.js'
import attivitaRoutes from './routes/attivita.js'
import trattativeRoutes from './routes/trattative.js'
import appuntamentiRoutes from './routes/appuntamenti.js'
import todoRoutes from './routes/todo.js'
import progettiRoutes from './routes/progetti.js'
import verificheRoutes from './routes/verifiche.js'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT) || 3001

app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
app.use('/api/', limiter)

app.use('/api/auth', authRoutes)
app.use('/api/clienti', clientiRoutes)
app.use('/api/attivita', attivitaRoutes)
app.use('/api/trattative', trattativeRoutes)
app.use('/api/appuntamenti', appuntamentiRoutes)
app.use('/api/todo', todoRoutes)
app.use('/api/progetti', progettiRoutes)
app.use('/api/verifiche', verificheRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use((req, res) => res.status(404).json({ message: 'Route non trovata' }))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato sulla porta ${PORT}`)
  sequelize.authenticate()
    .then(() => {
      console.log('Database connesso')
      return sequelize.sync({ force: false })
    })
    .then(() => console.log('Tabelle sincronizzate'))
    .catch(err => console.error('Errore DB:', err.message))
})

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

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT) || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clienti', clientiRoutes)
app.use('/api/attivita', attivitaRoutes)
app.use('/api/trattative', trattativeRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Route non trovata' }))

// Avvia server immediatamente, poi connette DB
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

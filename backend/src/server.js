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
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Troppe richieste, riprova tra poco'
})
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/clienti', clientiRoutes)
app.use('/api/attivita', attivitaRoutes)
app.use('/api/trattative', trattativeRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Route non trovata' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Errore interno del server' })
})

// Start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connesso')
    return sequelize.sync({ force: false })
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`))
  })
  .catch(err => {
    console.error('Errore connessione database:', err)
    process.exit(1)
  })

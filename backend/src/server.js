import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { Sequelize } from 'sequelize'

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

// Database
export const sequelize = new Sequelize(
  process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`,
  {
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DATABASE_URL ? {
      ssl: { require: true, rejectUnauthorized: false }
    } : {}
  }
)

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

// Start
sequelize.sync({ alter: false }).then(() => {
  console.log('Database connesso')
  app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`))
}).catch(err => {
  console.error('Errore connessione DB:', err)
  process.exit(1)
})

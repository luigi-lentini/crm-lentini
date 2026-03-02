import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

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

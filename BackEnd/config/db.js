module.exports = {
  CLIENT: process.env.DB_CLIENT || 'postgres',
  DATABASE_URL: process.env.DATABASE_URL || '',
  HOST: process.env.DB_HOST || 'localhost',
  USER: process.env.DB_USER || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || '',
  DB: process.env.DB_NAME || 'postgres',
  SSL: String(process.env.DB_SSL || 'true').toLowerCase() === 'true',
  pool: {
    max: Number(process.env.DB_POOL_MAX || 10),
    min: Number(process.env.DB_POOL_MIN || 0),
    acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
    idle: Number(process.env.DB_POOL_IDLE || 10000)
  }
};

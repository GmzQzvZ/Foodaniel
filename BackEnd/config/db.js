function deriveSupabaseHost() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];
    return projectRef ? `db.${projectRef}.supabase.co` : '';
  } catch (_) {
    return '';
  }
}

const supabaseHost = deriveSupabaseHost();
const configuredHost = process.env.DB_HOST || '';

module.exports = {
  CLIENT: process.env.DB_CLIENT || 'postgres',
  DATABASE_URL: process.env.DATABASE_URL || '',
  HOST: configuredHost && configuredHost !== 'localhost' ? configuredHost : supabaseHost || configuredHost || 'localhost',
  PORT: Number(process.env.DB_PORT || 5432),
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

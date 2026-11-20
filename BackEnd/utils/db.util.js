const { Pool } = require('pg');
const dbConfig = require('../config/db');

function toPgPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function buildPoolConfig() {
  const config = {
    ssl: dbConfig.SSL ? { rejectUnauthorized: false } : false,
    max: dbConfig.pool.max,
    idleTimeoutMillis: dbConfig.pool.idle,
    connectionTimeoutMillis: dbConfig.pool.acquire
  };
  if (dbConfig.DATABASE_URL) config.connectionString = dbConfig.DATABASE_URL;
  else Object.assign(config, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
  });
  return config;
}

const pool = new Pool(buildPoolConfig());

async function runQuery(sql, params = []) {
  let normalizedSql = String(sql || '');
  const isInsert = /^\s*INSERT\s+/i.test(normalizedSql);
  if (isInsert && !/\bRETURNING\b/i.test(normalizedSql)) {
    normalizedSql = `${normalizedSql} RETURNING id`;
  }
  const finalSql = toPgPlaceholders(normalizedSql);
  const result = await pool.query(finalSql, params);
  const rows = result.rows || [];
  const meta = {
    rowCount: result.rowCount,
    affectedRows: result.rowCount,
    insertId: rows[0]?.id ?? null
  };
  if (/^\s*(SELECT|WITH|SHOW|DESCRIBE)\s+/i.test(finalSql)) {
    return [rows, { rowCount: result.rowCount }];
  }
  return [meta, { rowCount: result.rowCount }];
}

module.exports = { query: runQuery, pool };

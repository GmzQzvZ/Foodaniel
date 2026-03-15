const { Pool } = require('pg');
const dbConfig = require('../config/db');

function toPgPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

function normalizeSql(sql) {
  return String(sql || '')
    .replace(/\s+AFTER\s+[a-zA-Z0-9_]+/gi, '')
    .replace(/\s+ENGINE=InnoDB/gi, '')
    .replace(/INT\s+UNSIGNED\s+AUTO_INCREMENT/gi, 'BIGSERIAL')
    .replace(/\s+AUTO_INCREMENT/gi, '')
    .replace(/INT\s+UNSIGNED/gi, 'BIGINT')
    .replace(/TINYINT\(1\)/gi, 'BOOLEAN')
    .replace(/ENUM\s*\(\s*'admin'\s*,\s*'user'\s*\)/gi, 'VARCHAR(10)')
    .replace(/DATETIME/gi, 'TIMESTAMPTZ')
    .replace(/,\s*KEY\s+[a-zA-Z0-9_]+\s*\([^)]+\)/gi, '');
}

function buildPoolConfig() {
  if (dbConfig.DATABASE_URL) {
    return {
      connectionString: dbConfig.DATABASE_URL,
      ssl: dbConfig.SSL ? { rejectUnauthorized: false } : false,
      max: dbConfig.pool.max,
      idleTimeoutMillis: dbConfig.pool.idle,
      connectionTimeoutMillis: dbConfig.pool.acquire
    };
  }

  return {
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    ssl: dbConfig.SSL ? { rejectUnauthorized: false } : false,
    max: dbConfig.pool.max,
    idleTimeoutMillis: dbConfig.pool.idle,
    connectionTimeoutMillis: dbConfig.pool.acquire
  };
}

const pool = new Pool(buildPoolConfig());

async function runQuery(sql, params = []) {
  let normalized = normalizeSql(sql);
  const trimmedOriginal = String(sql || '').trim();

  if (/^SHOW\s+COLUMNS\s+FROM\s+users\s+LIKE\s+\?/i.test(trimmedOriginal)) {
    normalized = 'SELECT column_name AS Field FROM information_schema.columns WHERE table_name = \'users\' AND column_name = $1';
    const result = await pool.query(normalized, params);
    return [result.rows, { rowCount: result.rowCount }];
  }

  const isInsert = /^\s*INSERT\s+/i.test(normalized);
  const isSelectLike = /^\s*(SELECT|WITH|SHOW|DESCRIBE)\s+/i.test(normalized);
  const hasReturning = /\bRETURNING\b/i.test(normalized);
  if (isInsert && !hasReturning) {
    normalized = `${normalized} RETURNING id`;
  }

  const finalSql = toPgPlaceholders(normalized);
  const result = await pool.query(finalSql, params);

  const meta = {
    rowCount: result.rowCount,
    affectedRows: result.rowCount,
    insertId: result.rows && result.rows[0] && result.rows[0].id ? result.rows[0].id : null
  };

  if (isSelectLike) {
    return [result.rows, { rowCount: result.rowCount }];
  }

  return [meta, { rowCount: result.rowCount }];
}

module.exports = {
  query: runQuery,
  pool
};

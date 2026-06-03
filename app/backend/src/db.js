const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// inicjalizacja bazy
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      status      TEXT NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

// sprawdzenie połączenia z bazą - używane przez endpoint /health
async function checkConnection() {
  await pool.query('SELECT 1');
}

module.exports = { pool, initDB, checkConnection };

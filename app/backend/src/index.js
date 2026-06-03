const express = require('express');
const { pool, initDB, checkConnection } = require('./db');

const app = express();
const PORT = 8080;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await checkConnection();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// zwraca listę wszystkich zadań posortowanych od najnowszego
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'błąd pobierania zadań', details: err.message });
  }
});

// tworzy nowe zadanie na podstawie danych z body
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'pole title jest wymagane' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'błąd tworzenia zadania', details: err.message });
  }
});

// aktualizuje status istniejącego zadania
app.patch('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'pole status jest wymagane' });
  }

  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'zadanie nie zostało znalezione' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'błąd aktualizacji zadania', details: err.message });
  }
});

// usuwa zadanie o podanym id
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'zadanie nie zostało znalezione' });
    }

    res.status(200).json({ message: 'zadanie usunięte', task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'błąd usuwania zadania', details: err.message });
  }
});

// uruchomienie serwera - najpierw inicjalizacja tabeli w bazie
async function start() {
  try {
    await initDB();
    console.log('tabela tasks gotowa');
    app.listen(PORT, () => {
      console.log(`serwer działa na porcie ${PORT}`);
    });
  } catch (err) {
    console.error('błąd startu aplikacji:', err.message);
    process.exit(1);
  }
}

start();

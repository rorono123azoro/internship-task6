const express = require('express');
const router  = express.Router();
const { getDb, persist } = require('../database');

// ── Helper: run a SELECT and return rows as objects ───────────────────────────
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows[0] ?? null;
}

// ── GET /api/users ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const db    = await getDb();
    const users = queryAll(db, 'SELECT * FROM users ORDER BY id DESC');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('GET /api/users:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const db   = await getDb();
    const user = queryOne(db, 'SELECT * FROM users WHERE id = ?', [+req.params.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('GET /api/users/:id:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
});

// ── POST /api/users ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email || age === undefined)
    return res.status(400).json({ success: false, message: 'Name, email, and age are required.' });
  if (typeof age !== 'number' || age < 0 || age > 150)
    return res.status(400).json({ success: false, message: 'Age must be a number between 0 and 150.' });

  try {
    const db = await getDb();

    // Check duplicate email
    const existing = queryOne(db, 'SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });

    db.run(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), age]
    );
    persist();

    const newUser = queryOne(db,
      'SELECT * FROM users WHERE id = (SELECT MAX(id) FROM users)'
    );
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    console.error('POST /api/users:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { name, email, age } = req.body;
  const id = +req.params.id;

  if (!name || !email || age === undefined)
    return res.status(400).json({ success: false, message: 'Name, email, and age are required.' });
  if (typeof age !== 'number' || age < 0 || age > 150)
    return res.status(400).json({ success: false, message: 'Age must be a number between 0 and 150.' });

  try {
    const db = await getDb();

    const targetUser = queryOne(db, 'SELECT id FROM users WHERE id = ?', [id]);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found.' });

    // Check duplicate email for OTHER users
    const dup = queryOne(db,
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.trim().toLowerCase(), id]
    );
    if (dup) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });

    db.run(
      'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
      [name.trim(), email.trim().toLowerCase(), age, id]
    );
    persist();

    const updated = queryOne(db, 'SELECT * FROM users WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /api/users/:id:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = +req.params.id;
  try {
    const db   = await getDb();
    const user = queryOne(db, 'SELECT id FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    db.run('DELETE FROM users WHERE id = ?', [id]);
    persist();

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('DELETE /api/users/:id:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

module.exports = router;

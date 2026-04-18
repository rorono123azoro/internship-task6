const fs   = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'users.sqlite');

let _db   = null;
let _ready = false;

/**
 * Returns a Promise that resolves with the sql.js Database instance.
 * On first call, loads or creates the SQLite file and creates the table.
 */
async function getDb() {
  if (_db && _ready) return _db;

  const SQL = await initSqlJs();

  // Load existing file or start fresh
  if (fs.existsSync(DB_PATH)) {
    const filebuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(filebuffer);
  } else {
    _db = new SQL.Database();
  }

  // Create table
  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      age        INTEGER NOT NULL,
      created_at TEXT    DEFAULT (datetime('now'))
    )
  `);

  persist(); // write initial state to disk
  _ready = true;
  return _db;
}

/** Persist in-memory database back to the file */
function persist() {
  if (!_db) return;
  const data = _db.export();
  const buf  = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buf);
}

module.exports = { getDb, persist };

import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'patronvote.db');

// Initialize sql.js
const SQL = await initSqlJs();

// Load existing database or create new one
let dbData;
try {
  if (fs.existsSync(dbPath)) {
    dbData = fs.readFileSync(dbPath);
  }
} catch (e) {
  // File doesn't exist yet, that's fine
}

const rawDb = dbData ? new SQL.Database(dbData) : new SQL.Database();

// Enable foreign keys
rawDb.run('PRAGMA foreign_keys = ON');

// Schema initialization
rawDb.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    avatar_color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL REFERENCES boards(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'under_review', 'planned', 'in_progress', 'completed', 'closed')),
    category TEXT DEFAULT 'feature',
    vote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_admin_reply INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id);
  CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
  CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
  CREATE INDEX IF NOT EXISTS idx_votes_post_id ON votes(post_id);
  CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
  CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
`);

/**
 * Wrapper around sql.js to provide a better-sqlite3-like API.
 * sql.js returns arrays of column names + arrays of values.
 * We convert to objects for easier use.
 */
const db = {
  /**
   * Returns a statement-like object with .get() and .all() and .run() methods.
   */
  prepare(sql) {
    return {
      /**
       * Get a single row as an object, or undefined if no results.
       */
      get(...params) {
        const stmt = rawDb.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          stmt.free();
          const obj = {};
          cols.forEach((col, i) => { obj[col] = vals[i]; });
          return obj;
        }
        stmt.free();
        return undefined;
      },

      /**
       * Get all rows as an array of objects.
       */
      all(...params) {
        const results = [];
        const stmt = rawDb.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          const obj = {};
          cols.forEach((col, i) => { obj[col] = vals[i]; });
          results.push(obj);
        }
        stmt.free();
        return results;
      },

      /**
       * Run a statement (INSERT/UPDATE/DELETE) and return info.
       */
      run(...params) {
        rawDb.run(sql, params);
        const lastId = rawDb.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0];
        const changes = rawDb.getRowsModified();
        db.save(); // Auto-save after mutations
        return { lastInsertRowid: lastId, changes };
      },
    };
  },

  /**
   * Execute raw SQL (for multi-statement schema initialization, etc.)
   */
  exec(sql) {
    rawDb.run(sql);
    db.save();
  },

  /**
   * Save the database to disk.
   */
  save() {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  },

  /**
   * Set a pragma.
   */
  pragma(pragma) {
    rawDb.run(`PRAGMA ${pragma}`);
  },
};

export default db;

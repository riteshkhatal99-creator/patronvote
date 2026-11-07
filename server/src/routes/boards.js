import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper — generate a URL-safe slug from a string
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// -------------------------------------------------------
// GET / — list all boards with post counts
// -------------------------------------------------------
router.get('/', (_req, res) => {
  try {
    const boards = db.prepare(`
      SELECT b.*, COUNT(p.id) AS post_count
      FROM boards b
      LEFT JOIN posts p ON p.board_id = b.id
      GROUP BY b.id
      ORDER BY b.created_at ASC
    `).all();

    res.json({ boards });
  } catch (err) {
    console.error('List boards error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// POST / — (admin) create a board
// -------------------------------------------------------
router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    let slug = slugify(name);

    // Ensure slug uniqueness
    const existing = db.prepare('SELECT id FROM boards WHERE slug = ?').get(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = db.prepare(
      'INSERT INTO boards (name, slug, description, color) VALUES (?, ?, ?, ?)'
    ).run(name, slug, description || null, color || '#6366f1');

    const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ board });
  } catch (err) {
    console.error('Create board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// GET /:slug — get board by slug with post counts
// -------------------------------------------------------
router.get('/:slug', (req, res) => {
  try {
    const board = db.prepare(`
      SELECT b.*, COUNT(p.id) AS post_count
      FROM boards b
      LEFT JOIN posts p ON p.board_id = b.id
      WHERE b.slug = ?
      GROUP BY b.id
    `).get(req.params.slug);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({ board });
  } catch (err) {
    console.error('Get board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// PUT /:slug — (admin) update a board
// -------------------------------------------------------
router.put('/:slug', authenticate, requireAdmin, (req, res) => {
  try {
    const board = db.prepare('SELECT * FROM boards WHERE slug = ?').get(req.params.slug);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const { name, description, color } = req.body;
    const updatedName = name || board.name;
    const updatedDescription = description !== undefined ? description : board.description;
    const updatedColor = color || board.color;

    // Re-slugify if name changed
    let updatedSlug = board.slug;
    if (name && name !== board.name) {
      updatedSlug = slugify(name);
      const existing = db.prepare('SELECT id FROM boards WHERE slug = ? AND id != ?').get(updatedSlug, board.id);
      if (existing) {
        updatedSlug = `${updatedSlug}-${Date.now()}`;
      }
    }

    db.prepare(
      'UPDATE boards SET name = ?, slug = ?, description = ?, color = ? WHERE id = ?'
    ).run(updatedName, updatedSlug, updatedDescription, updatedColor, board.id);

    const updated = db.prepare('SELECT * FROM boards WHERE id = ?').get(board.id);
    res.json({ board: updated });
  } catch (err) {
    console.error('Update board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// DELETE /:slug — (admin) delete a board
// -------------------------------------------------------
router.delete('/:slug', authenticate, requireAdmin, (req, res) => {
  try {
    const board = db.prepare('SELECT * FROM boards WHERE slug = ?').get(req.params.slug);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Cascade: remove related votes, comments, posts, then the board
    const postIds = db.prepare('SELECT id FROM posts WHERE board_id = ?').all(board.id).map(p => p.id);
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM votes WHERE post_id IN (${placeholders})`).run(...postIds);
      db.prepare(`DELETE FROM comments WHERE post_id IN (${placeholders})`).run(...postIds);
      db.prepare('DELETE FROM posts WHERE board_id = ?').run(board.id);
    }

    db.prepare('DELETE FROM boards WHERE id = ?').run(board.id);
    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Delete board error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

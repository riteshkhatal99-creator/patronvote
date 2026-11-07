import { Router } from 'express';
import db from '../db.js';

const router = Router();

// -------------------------------------------------------
// GET /api/widget/:boardSlug — get board posts for widget
// -------------------------------------------------------
router.get('/:boardSlug', (req, res) => {
  try {
    const board = db.prepare('SELECT * FROM boards WHERE slug = ?').get(req.params.boardSlug);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const posts = db.prepare(`
      SELECT p.id, p.title, p.description, p.vote_count, p.status, p.category,
             u.name AS author_name
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.board_id = ?
      ORDER BY p.vote_count DESC, p.created_at DESC
      LIMIT 20
    `).all(board.id);

    // Set CORS headers for widget embedding
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.json({
      board: { id: board.id, name: board.name, slug: board.slug, color: board.color },
      posts,
    });
  } catch (err) {
    console.error('Widget data error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// POST /api/widget/:boardSlug/posts — submit from widget (anonymous or guest)
// -------------------------------------------------------
router.post('/:boardSlug/posts', (req, res) => {
  try {
    const { title, description, category, guest_name, guest_email } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = db.prepare('SELECT * FROM boards WHERE slug = ?').get(req.params.boardSlug);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Find or create a guest user
    let userId;
    const email = guest_email?.trim() || `guest-${Date.now()}@widget.patronvote`;
    const name = guest_name?.trim() || 'Widget User';

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      userId = existing.id;
    } else {
      const result = db.prepare(
        'INSERT INTO users (name, email, password_hash, role, avatar_color) VALUES (?, ?, ?, ?, ?)'
      ).run(name, email, 'widget-user-no-login', 'user', '#94a3b8');
      userId = result.lastInsertRowid;
    }

    const result = db.prepare(
      'INSERT INTO posts (board_id, author_id, title, description, category) VALUES (?, ?, ?, ?, ?)'
    ).run(board.id, userId, title.trim(), description?.trim() || null, category || 'feature');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(201).json({ success: true, postId: result.lastInsertRowid });
  } catch (err) {
    console.error('Widget post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// POST /api/widget/:boardSlug/vote/:postId — vote from widget
// -------------------------------------------------------
router.post('/:boardSlug/vote/:postId', (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // For widget votes, we track by a fingerprint to prevent duplicates
    const { fingerprint } = req.body;
    const fpEmail = `widget-${fingerprint || Date.now()}@widget.patronvote`;

    let userId;
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(fpEmail);
    if (existing) {
      userId = existing.id;
      // Check if already voted
      const existingVote = db.prepare('SELECT id FROM votes WHERE post_id = ? AND user_id = ?').get(postId, userId);
      if (existingVote) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.json({ success: true, already_voted: true, vote_count: db.prepare('SELECT vote_count FROM posts WHERE id = ?').get(postId).vote_count });
      }
    } else {
      const result = db.prepare(
        'INSERT INTO users (name, email, password_hash, role, avatar_color) VALUES (?, ?, ?, ?, ?)'
      ).run('Widget Voter', fpEmail, 'widget-voter-no-login', 'user', '#94a3b8');
      userId = result.lastInsertRowid;
    }

    db.prepare('INSERT INTO votes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
    db.prepare('UPDATE posts SET vote_count = vote_count + 1 WHERE id = ?').run(postId);

    const updated = db.prepare('SELECT vote_count FROM posts WHERE id = ?').get(postId);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ success: true, vote_count: updated.vote_count });
  } catch (err) {
    console.error('Widget vote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle CORS preflight
router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

export default router;

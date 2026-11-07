import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require admin
router.use(authenticate, requireAdmin);

// -------------------------------------------------------
// GET /stats — dashboard statistics
// -------------------------------------------------------
router.get('/stats', (_req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const totalPosts = db.prepare('SELECT COUNT(*) AS count FROM posts').get().count;
    const totalVotes = db.prepare('SELECT COUNT(*) AS count FROM votes').get().count;
    const totalComments = db.prepare('SELECT COUNT(*) AS count FROM comments').get().count;

    // Posts broken down by status
    const postsByStatus = db.prepare(`
      SELECT status, COUNT(*) AS count
      FROM posts
      GROUP BY status
    `).all();

    res.json({
      stats: {
        total_users: totalUsers,
        total_posts: totalPosts,
        total_votes: totalVotes,
        total_comments: totalComments,
        posts_by_status: postsByStatus,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// GET /users — list all users with post & comment counts
// -------------------------------------------------------
router.get('/users', (_req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.avatar_color, u.created_at,
             COUNT(DISTINCT p.id) AS post_count,
             COUNT(DISTINCT c.id) AS comment_count
      FROM users u
      LEFT JOIN posts p ON p.author_id = u.id
      LEFT JOIN comments c ON c.author_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at ASC
    `).all();

    res.json({ users });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// PATCH /users/:id/role — update a user's role
// -------------------------------------------------------
router.patch('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);

    const updated = db.prepare('SELECT id, name, email, role, avatar_color, created_at FROM users WHERE id = ?').get(req.params.id);
    res.json({ user: updated });
  } catch (err) {
    console.error('Admin update role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import db from '../db.js';

const router = Router();

// -------------------------------------------------------
// GET / — posts grouped by roadmap statuses
// -------------------------------------------------------
router.get('/', (_req, res) => {
  try {
    const roadmapStatuses = ['planned', 'in_progress', 'completed'];

    const result = {};
    for (const status of roadmapStatuses) {
      result[status] = db.prepare(`
        SELECT p.*, u.name AS author_name, u.avatar_color AS author_avatar_color,
               b.name AS board_name, b.slug AS board_slug
        FROM posts p
        JOIN users u ON u.id = p.author_id
        JOIN boards b ON b.id = p.board_id
        WHERE p.status = ?
        ORDER BY p.vote_count DESC, p.created_at DESC
      `).all(status);
    }

    res.json({ roadmap: result });
  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

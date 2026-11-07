import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// -------------------------------------------------------
// GET / — list posts with filters, sorting, pagination
// -------------------------------------------------------
router.get('/', optionalAuth, (req, res) => {
  try {
    const {
      board_id,
      status,
      sort = 'top',
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause
    const conditions = [];
    const params = [];

    if (board_id) {
      conditions.push('p.board_id = ?');
      params.push(board_id);
    }
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderClause;
    switch (sort) {
      case 'newest':
        orderClause = 'ORDER BY p.created_at DESC';
        break;
      case 'oldest':
        orderClause = 'ORDER BY p.created_at ASC';
        break;
      case 'top':
      default:
        orderClause = 'ORDER BY p.vote_count DESC, p.created_at DESC';
        break;
    }

    // Count total for pagination
    const countRow = db.prepare(
      `SELECT COUNT(*) AS total FROM posts p ${whereClause}`
    ).get(...params);

    // Fetch posts with author info
    const posts = db.prepare(`
      SELECT p.*, u.name AS author_name, u.avatar_color AS author_avatar_color, b.name AS board_name, b.slug AS board_slug
      FROM posts p
      JOIN users u ON u.id = p.author_id
      JOIN boards b ON b.id = p.board_id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset);

    // Attach has_voted for authenticated user
    if (req.user) {
      const postIds = posts.map(p => p.id);
      if (postIds.length > 0) {
        const placeholders = postIds.map(() => '?').join(',');
        const userVotes = db.prepare(
          `SELECT post_id FROM votes WHERE user_id = ? AND post_id IN (${placeholders})`
        ).all(req.user.id, ...postIds);
        const votedSet = new Set(userVotes.map(v => v.post_id));
        posts.forEach(p => { p.has_voted = votedSet.has(p.id); });
      }
    } else {
      posts.forEach(p => { p.has_voted = false; });
    }

    res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countRow.total,
        totalPages: Math.ceil(countRow.total / limitNum),
      },
    });
  } catch (err) {
    console.error('List posts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// POST / — (authenticated) create post
// -------------------------------------------------------
router.post('/', authenticate, (req, res) => {
  try {
    const { board_id, title, description, category } = req.body;

    if (!board_id || !title) {
      return res.status(400).json({ error: 'board_id and title are required' });
    }

    // Verify board exists
    const board = db.prepare('SELECT id FROM boards WHERE id = ?').get(board_id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const result = db.prepare(
      'INSERT INTO posts (board_id, author_id, title, description, category) VALUES (?, ?, ?, ?, ?)'
    ).run(board_id, req.user.id, title, description || null, category || 'feature');

    const post = db.prepare(`
      SELECT p.*, u.name AS author_name, u.avatar_color AS author_avatar_color
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);
    post.has_voted = false;

    res.status(201).json({ post });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// GET /:id — get single post
// -------------------------------------------------------
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const post = db.prepare(`
      SELECT p.*, u.name AS author_name, u.avatar_color AS author_avatar_color,
             b.name AS board_name, b.slug AS board_slug
      FROM posts p
      JOIN users u ON u.id = p.author_id
      JOIN boards b ON b.id = p.board_id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if authenticated user has voted
    if (req.user) {
      const vote = db.prepare('SELECT id FROM votes WHERE post_id = ? AND user_id = ?').get(post.id, req.user.id);
      post.has_voted = !!vote;
    } else {
      post.has_voted = false;
    }

    res.json({ post });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// PATCH /:id/status — (admin) update post status
// -------------------------------------------------------
router.patch('/:id/status', authenticate, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    db.prepare('UPDATE posts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, post.id);

    const updated = db.prepare(`
      SELECT p.*, u.name AS author_name, u.avatar_color AS author_avatar_color
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.id = ?
    `).get(post.id);

    res.json({ post: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// POST /:id/vote — (authenticated) toggle vote
// -------------------------------------------------------
router.post('/:id/vote', authenticate, (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingVote = db.prepare('SELECT id FROM votes WHERE post_id = ? AND user_id = ?').get(postId, req.user.id);

    if (existingVote) {
      // Remove vote
      db.prepare('DELETE FROM votes WHERE id = ?').run(existingVote.id);
      db.prepare('UPDATE posts SET vote_count = vote_count - 1 WHERE id = ?').run(postId);
    } else {
      // Add vote
      db.prepare('INSERT INTO votes (post_id, user_id) VALUES (?, ?)').run(postId, req.user.id);
      db.prepare('UPDATE posts SET vote_count = vote_count + 1 WHERE id = ?').run(postId);
    }

    const updated = db.prepare('SELECT vote_count FROM posts WHERE id = ?').get(postId);

    res.json({
      has_voted: !existingVote,
      vote_count: updated.vote_count,
    });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// GET /:id/comments — list comments for a post
// -------------------------------------------------------
router.get('/:id/comments', (req, res) => {
  try {
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = db.prepare(`
      SELECT c.*, u.name AS author_name, u.avatar_color AS author_avatar_color, u.role AS author_role
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.id);

    res.json({ comments });
  } catch (err) {
    console.error('List comments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------
// POST /:id/comments — (authenticated) add comment
// -------------------------------------------------------
router.post('/:id/comments', authenticate, (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isAdminReply = req.user.role === 'admin' ? 1 : 0;

    const result = db.prepare(
      'INSERT INTO comments (post_id, author_id, content, is_admin_reply) VALUES (?, ?, ?, ?)'
    ).run(req.params.id, req.user.id, content.trim(), isAdminReply);

    // Update comment count on the post
    db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(req.params.id);

    const comment = db.prepare(`
      SELECT c.*, u.name AS author_name, u.avatar_color AS author_avatar_color, u.role AS author_role
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ comment });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

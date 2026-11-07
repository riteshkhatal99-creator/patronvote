import bcrypt from 'bcryptjs';
import db from './db.js';

// ---------------------------------------------------------------------------
// Seed script — populates the database with sample data
// ---------------------------------------------------------------------------

console.log('🌱 Seeding FeedVault database...\n');

// Clear existing data (order matters due to FK constraints)
db.prepare('DELETE FROM votes').run();
db.prepare('DELETE FROM comments').run();
db.prepare('DELETE FROM posts').run();
db.prepare('DELETE FROM boards').run();
db.prepare('DELETE FROM users').run();

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const adminHash = bcrypt.hashSync('admin123', 10);
const userHash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role, avatar_color) VALUES (?, ?, ?, ?, ?)'
);

const adminId = insertUser.run('Admin', 'admin@feedvault.com', adminHash, 'admin', '#6366f1').lastInsertRowid;
const aliceId = insertUser.run('Alice Johnson', 'alice@example.com', userHash, 'user', '#ec4899').lastInsertRowid;
const bobId = insertUser.run('Bob Smith', 'bob@example.com', userHash, 'user', '#10b981').lastInsertRowid;
const carolId = insertUser.run('Carol Davis', 'carol@example.com', userHash, 'user', '#f59e0b').lastInsertRowid;

console.log('✅ Created 4 users (admin + 3 regular)');

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------
const insertBoard = db.prepare(
  'INSERT INTO boards (name, slug, description, color) VALUES (?, ?, ?, ?)'
);

const featureBoardId = insertBoard.run(
  'Feature Requests', 'feature-requests',
  'Suggest new features you\'d love to see in the product.', '#6366f1'
).lastInsertRowid;

const bugBoardId = insertBoard.run(
  'Bug Reports', 'bug-reports',
  'Report bugs or issues you\'ve encountered.', '#ef4444'
).lastInsertRowid;

const improvementBoardId = insertBoard.run(
  'Improvements', 'improvements',
  'Suggest improvements to existing functionality.', '#10b981'
).lastInsertRowid;

console.log('✅ Created 3 boards');

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------
const insertPost = db.prepare(`
  INSERT INTO posts (board_id, author_id, title, description, status, category, vote_count, comment_count)
  VALUES (?, ?, ?, ?, ?, ?, 0, 0)
`);

const posts = [
  {
    board_id: featureBoardId, author_id: aliceId,
    title: 'Dark mode support',
    description: 'It would be great to have a dark mode option for the UI. Many users prefer dark themes, especially when working at night.',
    status: 'planned', category: 'feature',
  },
  {
    board_id: featureBoardId, author_id: bobId,
    title: 'Email notifications for subscribed posts',
    description: 'Allow users to subscribe to posts and receive email notifications when there are updates or new comments.',
    status: 'in_progress', category: 'feature',
  },
  {
    board_id: featureBoardId, author_id: carolId,
    title: 'Public API for integrations',
    description: 'Expose a public REST API so that third-party tools (Slack, Zapier, etc.) can integrate with the platform.',
    status: 'open', category: 'feature',
  },
  {
    board_id: featureBoardId, author_id: aliceId,
    title: 'Markdown support in descriptions',
    description: 'Support Markdown formatting in post descriptions and comments for better readability.',
    status: 'completed', category: 'feature',
  },
  {
    board_id: bugBoardId, author_id: bobId,
    title: 'Login page crashes on Safari',
    description: 'When using Safari 17, clicking the login button results in a blank white page. Works fine on Chrome and Firefox.',
    status: 'under_review', category: 'bug',
  },
  {
    board_id: bugBoardId, author_id: carolId,
    title: 'Vote count sometimes shows negative values',
    description: 'I noticed that certain posts briefly display a negative vote count after un-voting. Seems like a race condition.',
    status: 'in_progress', category: 'bug',
  },
  {
    board_id: improvementBoardId, author_id: aliceId,
    title: 'Improve search with filters',
    description: 'The current search is basic text matching. Adding filters for status, board, and date range would be very helpful.',
    status: 'planned', category: 'improvement',
  },
  {
    board_id: improvementBoardId, author_id: bobId,
    title: 'Better mobile responsiveness',
    description: 'The layout breaks on smaller screens. The sidebar overlaps with the main content area on phones.',
    status: 'open', category: 'improvement',
  },
  {
    board_id: improvementBoardId, author_id: carolId,
    title: 'Add sorting options to board view',
    description: 'Allow sorting posts by newest, most voted, and most commented within each board.',
    status: 'completed', category: 'improvement',
  },
  {
    board_id: featureBoardId, author_id: bobId,
    title: 'SSO / OAuth login support',
    description: 'Support login via Google, GitHub, or other OAuth providers for easier onboarding.',
    status: 'open', category: 'feature',
  },
];

const postIds = posts.map((p) => {
  return insertPost.run(p.board_id, p.author_id, p.title, p.description, p.status, p.category).lastInsertRowid;
});

console.log(`✅ Created ${posts.length} posts`);

// ---------------------------------------------------------------------------
// Votes
// ---------------------------------------------------------------------------
const insertVote = db.prepare('INSERT INTO votes (post_id, user_id) VALUES (?, ?)');

const voteMappings = [
  [0, aliceId], [0, bobId], [0, carolId], [0, adminId],   // Dark mode — 4 votes
  [1, aliceId], [1, carolId], [1, adminId],                // Email notifs — 3 votes
  [2, bobId], [2, carolId],                                 // Public API — 2 votes
  [3, aliceId], [3, bobId], [3, carolId],                   // Markdown — 3 votes
  [4, bobId], [4, aliceId],                                 // Safari bug — 2 votes
  [5, carolId],                                              // Negative vote count — 1 vote
  [6, aliceId], [6, bobId], [6, carolId], [6, adminId],     // Search filters — 4 votes
  [7, bobId],                                                // Mobile resp — 1 vote
  [8, carolId], [8, adminId],                                // Sorting options — 2 votes
  [9, bobId], [9, aliceId], [9, adminId],                   // SSO — 3 votes
];

for (const [postIdx, userId] of voteMappings) {
  insertVote.run(postIds[postIdx], userId);
}

// Update vote_count on each post
const updateVoteCount = db.prepare(
  'UPDATE posts SET vote_count = (SELECT COUNT(*) FROM votes WHERE post_id = ?) WHERE id = ?'
);
for (const pid of postIds) {
  updateVoteCount.run(pid, pid);
}

console.log(`✅ Created ${voteMappings.length} votes`);

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
const insertComment = db.prepare(
  'INSERT INTO comments (post_id, author_id, content, is_admin_reply) VALUES (?, ?, ?, ?)'
);

const commentsData = [
  { postIdx: 0, author: bobId, content: 'Yes please! I always use dark mode wherever possible.', isAdmin: 0 },
  { postIdx: 0, author: adminId, content: 'This is on our roadmap for Q1. We\'ll start with a toggle in user settings.', isAdmin: 1 },
  { postIdx: 0, author: carolId, content: 'Looking forward to this! Will it follow the system preference?', isAdmin: 0 },
  { postIdx: 1, author: aliceId, content: 'This would save me so much time — I keep checking manually.', isAdmin: 0 },
  { postIdx: 1, author: adminId, content: 'We\'re currently building this. Expect a beta in the next release!', isAdmin: 1 },
  { postIdx: 2, author: adminId, content: 'Interesting idea. Can you share more about your use case?', isAdmin: 1 },
  { postIdx: 2, author: carolId, content: 'I\'d love to pipe new feature requests into our Slack channel automatically.', isAdmin: 0 },
  { postIdx: 4, author: adminId, content: 'Thanks for reporting. We\'re investigating this now.', isAdmin: 1 },
  { postIdx: 6, author: bobId, content: 'Date range filtering would be especially useful for finding recent requests.', isAdmin: 0 },
  { postIdx: 9, author: carolId, content: 'Google login would make onboarding so much easier for our team.', isAdmin: 0 },
  { postIdx: 9, author: adminId, content: 'We\'re evaluating OAuth providers. Google and GitHub are top priorities.', isAdmin: 1 },
];

for (const c of commentsData) {
  insertComment.run(postIds[c.postIdx], c.author, c.content, c.isAdmin);
}

// Update comment_count on each post
const updateCommentCount = db.prepare(
  'UPDATE posts SET comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = ?) WHERE id = ?'
);
for (const pid of postIds) {
  updateCommentCount.run(pid, pid);
}

console.log(`✅ Created ${commentsData.length} comments`);

console.log('\n🎉 Seeding complete!');
console.log('   Admin login: admin@feedvault.com / admin123');

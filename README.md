# 🗳️ PatronVote

**The open-source feedback platform that lets your users vote on what you build next.**

A beautiful, self-hostable alternative to Canny.io — collect feature requests, let users upvote ideas, and share a public roadmap. Free forever.

![PatronVote](https://img.shields.io/badge/version-1.0.0-indigo) ![License](https://img.shields.io/badge/license-MIT-green) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## ✨ Features

- 📋 **Feedback Boards** — Organize requests by category
- 👍 **Upvote System** — Users vote on what matters most
- 💬 **Comments** — Discuss ideas with threaded comments
- 🗺️ **Public Roadmap** — Kanban view of Planned → In Progress → Completed
- ⚙️ **Admin Dashboard** — Stats, user management, status updates
- 🔌 **Embeddable Widget** — One-line script tag for any website
- 🔐 **Authentication** — JWT-based login/register
- 🔍 **Search & Filters** — Sort by votes, status, and keywords
- 📱 **Responsive** — Works beautifully on mobile
- 🆓 **Free & Open Source** — MIT licensed, self-host anywhere

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · Vite · Tailwind CSS · React Router v6 |
| Backend | Express.js · JWT · bcrypt |
| Database | SQLite (sql.js — zero native deps) |
| Icons | Lucide React |
| Deploy | Docker · Railway |

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/patronvote.git
cd patronvote

# 2. Install dependencies
cd server && npm install && cd ../client && npm install && cd ..

# 3. Seed sample data
cd server && node src/seed.js && cd ..

# 4. Start development (two terminals)
# Terminal 1:
cd server && node src/index.js

# Terminal 2:
cd client && npx vite

# 5. Open http://localhost:5173
```

**Default admin:** `admin@feedvault.com` / `admin123`

## 🔌 Embed Widget

Add the feedback widget to any website with one line:

```html
<script src="https://your-patronvote-url.com/widget.js" data-board="feature-requests"></script>
```

Options:
- `data-board` — Board slug to show (default: `feature-requests`)
- `data-position` — `right` or `left` (default: `right`)
- `data-color` — Brand color hex (default: `#6366f1`)

## 🐳 Deploy with Docker

```bash
docker build -t patronvote .
docker run -p 3001:3001 -e JWT_SECRET=your-secret -e NODE_ENV=production patronvote
```

## 🚂 Deploy to Railway

1. Push to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Set env vars: `JWT_SECRET`, `NODE_ENV=production`
4. Deploy — Railway auto-detects the Dockerfile

## 📁 Project Structure

```
patronvote/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Navbar, PostCard, VoteButton, etc.
│   │   ├── pages/             # Landing, Boards, Roadmap, Admin, etc.
│   │   ├── context/           # Auth context
│   │   └── api.js             # API client
│   └── public/
│       └── widget.js          # Embeddable widget script
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # auth, boards, posts, roadmap, admin, widget
│   │   ├── middleware/        # JWT auth
│   │   ├── db.js              # SQLite setup
│   │   └── seed.js            # Sample data
├── Dockerfile
├── railway.json
└── README.md
```

## 📜 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/boards` | — | List all boards |
| POST | `/api/boards` | Admin | Create board |
| GET | `/api/boards/:slug` | — | Get board |
| GET | `/api/posts` | — | List posts (filterable) |
| POST | `/api/posts` | ✅ | Create post |
| POST | `/api/posts/:id/vote` | ✅ | Toggle vote |
| PATCH | `/api/posts/:id/status` | Admin | Update status |
| GET | `/api/posts/:id/comments` | — | List comments |
| POST | `/api/posts/:id/comments` | ✅ | Add comment |
| GET | `/api/roadmap` | — | Get roadmap |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/widget/:board` | — | Widget data |

## 📄 License

MIT — do whatever you want with it. ❤️

---

**Built with ❤️ for makers who listen to their users.**

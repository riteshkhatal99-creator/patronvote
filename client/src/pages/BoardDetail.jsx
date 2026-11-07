import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBoardBySlug, getPosts } from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { ArrowLeft, Plus, Search, SlidersHorizontal } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

const SORT_OPTIONS = [
  { value: 'top', label: 'Top Voted' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export default function BoardDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', sort: 'top', search: '' });

  useEffect(() => {
    loadBoard();
  }, [slug]);

  useEffect(() => {
    if (board) loadPosts();
  }, [board, filters]);

  async function loadBoard() {
    try {
      const data = await getBoardBySlug(slug);
      setBoard(data.board || data);
    } catch (err) {
      console.error('Failed to load board:', err);
    }
  }

  async function loadPosts() {
    setLoading(true);
    try {
      const params = { board_id: board.id };
      if (filters.status) params.status = filters.status;
      if (filters.sort) params.sort = filters.sort;
      if (filters.search) params.search = filters.search;
      const data = await getPosts(params);
      setPosts(data.posts || data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }

  function handlePostCreated() {
    setShowCreateModal(false);
    loadPosts();
  }

  if (!board && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Board not found</h2>
        <Link to="/boards" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Back to boards
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <Link to="/boards" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition mb-6">
        <ArrowLeft size={16} />
        All Boards
      </Link>

      {board && (
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color || '#6366f1' }} />
                <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
              </div>
              {board.description && (
                <p className="text-gray-500">{board.description}</p>
              )}
            </div>

            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 shrink-0"
              >
                <Plus size={18} />
                New Post
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search posts..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-500">No posts yet</h3>
          <p className="text-gray-400 text-sm mt-1">Be the first to share an idea!</p>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <Plus size={16} />
              Create Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={loadPosts} />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && board && (
        <CreatePostModal
          boardId={board.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}

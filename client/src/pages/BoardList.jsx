import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBoards, createBoard } from '../api';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, Plus, MessageSquare, X } from 'lucide-react';

const BOARD_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#0ea5e9', '#6b7280'];

export default function BoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: '', description: '', color: '#6366f1' });
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    try {
      const data = await getBoards();
      setBoards(data.boards || data);
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await createBoard(newBoard);
      setNewBoard({ name: '', description: '', color: '#6366f1' });
      setShowCreate(false);
      loadBoards();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutGrid className="text-primary-600" size={28} />
            Feedback Boards
          </h1>
          <p className="mt-1 text-gray-500">Browse boards and share your ideas</p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            <Plus size={18} />
            New Board
          </button>
        )}
      </div>

      {/* Create Board Modal */}
      {showCreate && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create New Board</h2>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board Name</label>
              <input
                type="text"
                value={newBoard.name}
                onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g. Feature Requests"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newBoard.description}
                onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                rows={2}
                placeholder="What is this board for?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2">
                {BOARD_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewBoard({ ...newBoard, color: c })}
                    className={`h-8 w-8 rounded-full transition ${newBoard.color === c ? 'ring-2 ring-offset-2 ring-primary-600 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Board'}
            </button>
          </form>
        </div>
      )}

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-20">
          <LayoutGrid className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-500">No boards yet</h3>
          <p className="text-gray-400 text-sm mt-1">Create a board to start collecting feedback.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.slug}`}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-gray-200"
            >
              <div
                className="mb-4 h-2 w-16 rounded-full"
                style={{ backgroundColor: board.color || '#6366f1' }}
              />
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition">
                {board.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {board.description || 'No description'}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                <MessageSquare size={14} />
                {board.post_count ?? 0} posts
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRoadmap } from '../api';
import StatusBadge from '../components/StatusBadge';
import { Map, ChevronUp, MessageSquare } from 'lucide-react';

const COLUMNS = [
  { key: 'planned', label: 'Planned', color: 'border-blue-400', bg: 'bg-blue-50' },
  { key: 'in_progress', label: 'In Progress', color: 'border-purple-400', bg: 'bg-purple-50' },
  { key: 'completed', label: 'Completed', color: 'border-green-400', bg: 'bg-green-50' },
];

export default function Roadmap() {
  const [data, setData] = useState({ planned: [], in_progress: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planned');

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    try {
      const res = await getRoadmap();
      setData(res.roadmap || res);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Map className="text-primary-600" size={28} />
          Roadmap
        </h1>
        <p className="mt-2 text-gray-500">See what we're working on and what's coming next</p>
      </div>

      {/* Mobile Tabs */}
      <div className="flex md:hidden mb-6 rounded-xl bg-white p-1 ring-1 ring-gray-200">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            onClick={() => setActiveTab(col.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === col.key
                ? 'bg-primary-600 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {col.label} ({(data[col.key] || []).length})
          </button>
        ))}
      </div>

      {/* Desktop Columns */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <RoadmapColumn key={col.key} column={col} posts={data[col.key] || []} />
        ))}
      </div>

      {/* Mobile Single Column */}
      <div className="md:hidden">
        {COLUMNS.filter((c) => c.key === activeTab).map((col) => (
          <RoadmapColumn key={col.key} column={col} posts={data[col.key] || []} />
        ))}
      </div>
    </div>
  );
}

function RoadmapColumn({ column, posts }) {
  return (
    <div>
      <div className={`mb-4 rounded-xl ${column.bg} px-4 py-3 border-l-4 ${column.color}`}>
        <h2 className="text-sm font-semibold text-gray-800">
          {column.label}
          <span className="ml-2 text-gray-400 font-normal">({posts.length})</span>
        </h2>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">Nothing here yet</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-gray-200"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <ChevronUp size={14} className="text-primary-500" />
                  {post.vote_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare size={12} />
                  {post.comment_count || 0}
                </span>
              </div>
              {post.board_name && (
                <span className="mt-2 inline-block rounded-full bg-surface-100 px-2 py-0.5 text-[10px] text-gray-500">
                  {post.board_name}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

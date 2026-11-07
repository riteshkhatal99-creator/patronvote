import { useNavigate } from 'react-router-dom';
import VoteButton from './VoteButton';
import StatusBadge from './StatusBadge';
import { toggleVote } from '../api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Calendar } from 'lucide-react';

const CATEGORY_COLORS = {
  feature: 'bg-indigo-50 text-indigo-600',
  bug: 'bg-red-50 text-red-600',
  improvement: 'bg-teal-50 text-teal-600',
  other: 'bg-gray-100 text-gray-600',
};

export default function PostCard({ post, onVote }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const categoryClass = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.other;
  const dateStr = new Date(post.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  async function handleVote() {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await toggleVote(post.id);
      if (onVote) onVote();
    } catch (err) {
      console.error('Vote failed:', err);
    }
  }

  return (
    <div
      onClick={() => navigate(`/posts/${post.id}`)}
      className="flex gap-4 p-4 bg-white rounded-xl border border-surface-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer group"
    >
      {/* Vote button */}
      <VoteButton
        postId={post.id}
        voteCount={post.vote_count || 0}
        hasVoted={post.has_voted || false}
        onVote={handleVote}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {post.title}
          </h3>
          <StatusBadge status={post.status} />
        </div>

        {post.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {post.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${categoryClass}`}>
            {post.category || 'other'}
          </span>
          <span className="hidden sm:inline">
            by <span className="text-gray-600 font-medium">{post.author_name || 'Anonymous'}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {dateStr}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {post.comment_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

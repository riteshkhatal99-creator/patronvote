import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, toggleVote, updatePostStatus, getComments, addComment } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import VoteButton from '../components/VoteButton';
import { ArrowLeft, MessageSquare, Calendar, User, Send, Shield } from 'lucide-react';

const STATUS_OPTIONS = ['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed'];

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  async function loadPost() {
    try {
      const data = await getPost(id);
      setPost(data.post || data);
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      const data = await getComments(id);
      setComments(data.comments || data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  }

  async function handleVote() {
    if (!user) return navigate('/login');
    try {
      const data = await toggleVote(id);
      setPost((prev) => ({
        ...prev,
        vote_count: data.vote_count,
        has_voted: data.has_voted,
      }));
    } catch (err) {
      console.error('Vote failed:', err);
    }
  }

  async function handleStatusChange(status) {
    try {
      await updatePostStatus(id, status);
      setPost((prev) => ({ ...prev, status }));
      setShowStatusMenu(false);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addComment(id, newComment);
      setNewComment('');
      loadComments();
      setPost((prev) => ({ ...prev, comment_count: (prev.comment_count || 0) + 1 }));
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getInitials(name) {
    return (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Post not found</h2>
        <Link to="/boards" className="mt-4 inline-block text-primary-600 hover:underline">← Back to boards</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Link */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition mb-6">
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Post Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex gap-5">
          {/* Vote */}
          <div className="shrink-0">
            <VoteButton
              postId={post.id}
              voteCount={post.vote_count}
              hasVoted={post.has_voted}
              onVote={handleVote}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>

              {/* Status */}
              <div className="relative shrink-0">
                {user?.role === 'admin' ? (
                  <>
                    <button onClick={() => setShowStatusMenu(!showStatusMenu)}>
                      <StatusBadge status={post.status} />
                    </button>
                    {showStatusMenu && (
                      <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-xl bg-white p-1 shadow-lg ring-1 ring-gray-200">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 ${post.status === s ? 'font-semibold text-primary-600' : 'text-gray-700'}`}
                          >
                            {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <StatusBadge status={post.status} />
                )}
              </div>
            </div>

            {/* Description */}
            {post.description && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-4">
                {post.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <User size={12} />
                {post.author_name || 'Anonymous'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.created_at)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={12} />
                {post.comment_count || 0} comments
              </span>
              {post.category && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                  {post.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <MessageSquare size={20} className="text-primary-600" />
          Comments ({comments.length})
        </h2>

        {/* Comment List */}
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-xl p-4 ${
                  comment.is_admin_reply
                    ? 'bg-primary-50 ring-1 ring-primary-100'
                    : 'bg-white ring-1 ring-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                      comment.is_admin_reply ? 'bg-primary-600' : 'bg-gray-400'
                    }`}
                    style={{ backgroundColor: comment.author_color || undefined }}
                  >
                    {getInitials(comment.author_name)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comment.author_name}</span>
                    {comment.is_admin_reply ? (
                      <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
                        <Shield size={10} />
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        {user ? (
          <form onSubmit={handleComment} className="rounded-xl bg-white p-4 ring-1 ring-gray-100">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? 'Sending...' : 'Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <Link to="/login" className="text-sm text-primary-600 hover:underline">
              Sign in to comment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

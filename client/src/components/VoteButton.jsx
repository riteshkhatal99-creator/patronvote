import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * VoteButton – upvote toggle with animation.
 *
 * Props:
 *  - postId      – id of the post
 *  - voteCount   – current vote count
 *  - hasVoted    – whether the current user has already voted
 *  - onVote      – async callback that performs the API call
 */
export default function VoteButton({ postId, voteCount, hasVoted, onVote }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  async function handleClick(e) {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    setAnimating(true);
    try {
      await onVote(postId);
    } catch {
      // silently ignore
    } finally {
      setTimeout(() => setAnimating(false), 300);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center gap-0.5 min-w-[3rem] py-2 px-2
        rounded-xl border-2 transition-all duration-200 select-none
        ${
          hasVoted
            ? 'border-primary-500 bg-primary-50 text-primary-600'
            : 'border-surface-200 bg-white text-gray-500 hover:border-primary-300 hover:text-primary-500'
        }
        ${animating ? 'scale-110' : 'scale-100'}
      `}
      title={hasVoted ? 'Remove vote' : 'Upvote'}
    >
      <ChevronUp
        size={18}
        className={`transition-transform duration-200 ${animating ? '-translate-y-0.5' : ''}`}
      />
      <span className="text-sm font-semibold leading-none">{voteCount}</span>
    </button>
  );
}

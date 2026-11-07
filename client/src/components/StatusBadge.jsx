/**
 * StatusBadge – renders a coloured pill for a post's status.
 */

const STATUS_CONFIG = {
  open: {
    label: 'Open',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-400',
  },
  planned: {
    label: 'Planned',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-400',
  },
  closed: {
    label: 'Closed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-400',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

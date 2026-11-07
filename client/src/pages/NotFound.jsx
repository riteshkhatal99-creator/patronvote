import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <FileQuestion className="mx-auto text-gray-300 mb-6" size={64} />
        <h1 className="text-6xl font-extrabold text-gray-200 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import BoardList from './pages/BoardList';
import BoardDetail from './pages/BoardDetail';
import PostDetail from './pages/PostDetail';
import Roadmap from './pages/Roadmap';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

/**
 * Redirect to /boards when already authenticated, otherwise show Landing.
 */
function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/boards" replace /> : <Landing />;
}

/**
 * Guard that redirects non-admin users to /.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/boards" element={<BoardList />} />
                <Route path="/boards/:slug" element={<BoardDetail />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

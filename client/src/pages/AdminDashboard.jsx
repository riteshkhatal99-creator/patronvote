import { useState, useEffect } from 'react';
import { getAdminStats, getAdminUsers, updateUserRole, getBoards } from '../api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, MessageSquare, ThumbsUp, FileText, Shield, ShieldOff, Code, Copy, Check } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsData, usersData, boardsData] = await Promise.all([getAdminStats(), getAdminUsers(), getBoards()]);
      setStats(statsData.stats || statsData);
      setUsers(usersData.users || usersData);
      setBoards(boardsData.boards || boardsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Posts', value: stats.total_posts, icon: FileText, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Votes', value: stats.total_votes, icon: ThumbsUp, color: 'bg-green-50 text-green-600' },
    { label: 'Total Comments', value: stats.total_comments, icon: MessageSquare, color: 'bg-orange-50 text-orange-600' },
  ] : [];

  const statusBreakdown = stats?.posts_by_status || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="text-primary-600" size={28} />
          Admin Dashboard
        </h1>
        <p className="mt-1 text-gray-500">Manage your feedback platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      {statusBreakdown.length > 0 && (
        <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts by Status</h2>
          <div className="space-y-3">
            {statusBreakdown.map((item) => {
              const total = stats.total_posts || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600 capitalize">{(item.status || 'unknown').replace('_', ' ')}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-gray-700">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Management */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">User</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Joined</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{ backgroundColor: u.avatar_color || '#6366f1' }}
                      >
                        {(u.name || 'U')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' && <Shield size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {u.id !== user.id && (
                      <button
                        onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <><ShieldOff size={12} /> Remove Admin</>
                        ) : (
                          <><Shield size={12} /> Make Admin</>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embed Widget Section */}
      <div className="mt-10 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Code size={20} className="text-primary-600" />
            Embed Widget
          </h2>
          <p className="text-sm text-gray-500 mt-1">Add the feedback widget to your website with a single line of code</p>
        </div>
        <div className="p-6 space-y-4">
          {boards.map((board) => {
            const embedCode = `<script src="${window.location.origin}/widget.js" data-board="${board.slug}"></script>`;
            return (
              <div key={board.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color || '#6366f1' }} />
                    <span className="text-sm font-medium text-gray-900">{board.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode);
                      setCopied(board.id);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition"
                  >
                    {copied === board.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Code</>}
                  </button>
                </div>
                <pre className="rounded-lg bg-gray-900 text-gray-300 p-3 text-xs font-mono overflow-x-auto">
                  {embedCode}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

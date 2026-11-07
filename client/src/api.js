/**
 * API helper module for FeedVault.
 * All requests are proxied through Vite to http://localhost:3001.
 */

const BASE_URL = '/api';

/**
 * Generic fetch wrapper with JSON headers and auth token.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getMe() {
  return request('/auth/me');
}

// ─── Boards ──────────────────────────────────────────────────────────────────

export async function getBoards() {
  return request('/boards');
}

export async function createBoard(boardData) {
  return request('/boards', {
    method: 'POST',
    body: JSON.stringify(boardData),
  });
}

export async function getBoardBySlug(slug) {
  return request(`/boards/${slug}`);
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function getPosts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/posts${query ? `?${query}` : ''}`);
}

export async function createPost(postData) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function getPost(id) {
  return request(`/posts/${id}`);
}

export async function toggleVote(postId) {
  return request(`/posts/${postId}/vote`, {
    method: 'POST',
  });
}

export async function updatePostStatus(id, status) {
  return request(`/posts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(postId) {
  return request(`/posts/${postId}/comments`);
}

export async function addComment(postId, content) {
  return request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export async function getRoadmap() {
  return request('/roadmap');
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  return request('/admin/stats');
}

export async function getAdminUsers() {
  return request('/admin/users');
}

export async function updateUserRole(userId, role) {
  return request(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

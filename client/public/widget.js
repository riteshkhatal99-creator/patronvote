/**
 * PatronVote Embeddable Widget
 * Usage: <script src="https://yoursite.com/widget.js" data-board="feature-requests"></script>
 */
(function () {
  'use strict';

  const script = document.currentScript;
  const boardSlug = script?.getAttribute('data-board') || 'feature-requests';
  const position = script?.getAttribute('data-position') || 'right';
  const color = script?.getAttribute('data-color') || '#6366f1';
  const baseUrl = script?.src ? new URL(script.src).origin : window.location.origin;

  // Fingerprint for vote dedup
  const fp = 'pv_' + Math.random().toString(36).substring(2, 15);
  const storedFp = localStorage.getItem('patronvote_fp') || fp;
  if (!localStorage.getItem('patronvote_fp')) localStorage.setItem('patronvote_fp', storedFp);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #pv-widget-trigger {
      position: fixed;
      bottom: 24px;
      ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: ${color};
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
      transition: transform 0.2s, box-shadow 0.2s;
      font-family: -apple-system, system-ui, sans-serif;
    }
    #pv-widget-trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(0,0,0,0.2);
    }
    #pv-widget-trigger svg { width: 24px; height: 24px; }

    #pv-widget-panel {
      position: fixed;
      bottom: 92px;
      ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
      width: 360px;
      max-height: 520px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.15);
      z-index: 99999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, system-ui, 'Segoe UI', sans-serif;
      animation: pvSlideUp 0.25s ease;
    }
    #pv-widget-panel.pv-open { display: flex; }

    @keyframes pvSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .pv-header {
      padding: 16px 20px;
      background: ${color};
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pv-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
    .pv-header button {
      background: none; border: none; color: white; cursor: pointer;
      font-size: 18px; padding: 4px; opacity: 0.8;
    }
    .pv-header button:hover { opacity: 1; }

    .pv-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
    }
    .pv-tab {
      flex: 1;
      padding: 10px;
      text-align: center;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: none;
      color: #6b7280;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .pv-tab.active {
      color: ${color};
      border-bottom-color: ${color};
    }

    .pv-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
    }

    .pv-post-item {
      display: flex;
      gap: 10px;
      padding: 10px;
      border-radius: 10px;
      cursor: default;
      transition: background 0.15s;
    }
    .pv-post-item:hover { background: #f9fafb; }

    .pv-vote-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 42px;
      padding: 6px 4px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      background: white;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      transition: all 0.2s;
    }
    .pv-vote-btn:hover, .pv-vote-btn.voted {
      border-color: ${color};
      color: ${color};
      background: ${color}11;
    }
    .pv-vote-btn svg { width: 14px; height: 14px; margin-bottom: 2px; }

    .pv-post-title {
      font-size: 13px;
      font-weight: 500;
      color: #111827;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }
    .pv-post-status {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 99px;
      font-weight: 500;
      display: inline-block;
    }

    .pv-form { padding: 16px; }
    .pv-form input, .pv-form textarea, .pv-form select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 10px;
      font-family: inherit;
      box-sizing: border-box;
      transition: border 0.2s;
    }
    .pv-form input:focus, .pv-form textarea:focus {
      outline: none;
      border-color: ${color};
      box-shadow: 0 0 0 3px ${color}22;
    }
    .pv-form textarea { resize: none; height: 80px; }
    .pv-submit-btn {
      width: 100%;
      padding: 10px;
      background: ${color};
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .pv-submit-btn:hover { opacity: 0.9; }
    .pv-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .pv-footer {
      padding: 8px 16px;
      text-align: center;
      border-top: 1px solid #f3f4f6;
    }
    .pv-footer a {
      font-size: 11px;
      color: #9ca3af;
      text-decoration: none;
    }
    .pv-footer a:hover { color: ${color}; }

    .pv-empty {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 13px;
    }
    .pv-success {
      text-align: center;
      padding: 32px 24px;
      color: #059669;
      font-size: 14px;
      font-weight: 500;
    }

    @media (max-width: 420px) {
      #pv-widget-panel {
        width: calc(100vw - 32px);
        left: 16px;
        right: 16px;
        bottom: 88px;
      }
    }
  `;
  document.head.appendChild(style);

  // Build widget HTML
  const trigger = document.createElement('button');
  trigger.id = 'pv-widget-trigger';
  trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  trigger.title = 'Share Feedback';
  document.body.appendChild(trigger);

  const panel = document.createElement('div');
  panel.id = 'pv-widget-panel';
  panel.innerHTML = `
    <div class="pv-header">
      <h3>💬 Feedback</h3>
      <button id="pv-close">&times;</button>
    </div>
    <div class="pv-tabs">
      <button class="pv-tab active" data-tab="ideas">Top Ideas</button>
      <button class="pv-tab" data-tab="submit">Submit Idea</button>
    </div>
    <div class="pv-body" id="pv-ideas-view">
      <div class="pv-empty">Loading…</div>
    </div>
    <div class="pv-form" id="pv-submit-view" style="display:none">
      <input type="text" id="pv-title" placeholder="Your idea in a few words…" maxlength="120" />
      <textarea id="pv-desc" placeholder="Add details (optional)…"></textarea>
      <input type="text" id="pv-name" placeholder="Your name (optional)" />
      <input type="email" id="pv-email" placeholder="Your email (optional)" />
      <button class="pv-submit-btn" id="pv-submit">Submit Feedback</button>
    </div>
    <div class="pv-footer">
      <a href="${baseUrl}" target="_blank">Powered by PatronVote</a>
    </div>
  `;
  document.body.appendChild(panel);

  // Status colors
  const statusColors = {
    open: { bg: '#f3f4f6', color: '#374151' },
    planned: { bg: '#dbeafe', color: '#1d4ed8' },
    in_progress: { bg: '#f3e8ff', color: '#7c3aed' },
    completed: { bg: '#dcfce7', color: '#16a34a' },
    under_review: { bg: '#fef9c3', color: '#a16207' },
    closed: { bg: '#fee2e2', color: '#dc2626' },
  };

  // Toggle widget
  trigger.addEventListener('click', () => {
    panel.classList.toggle('pv-open');
    if (panel.classList.contains('pv-open')) loadPosts();
  });

  panel.querySelector('#pv-close').addEventListener('click', () => {
    panel.classList.remove('pv-open');
  });

  // Tab switching
  panel.querySelectorAll('.pv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.pv-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.getAttribute('data-tab');
      document.getElementById('pv-ideas-view').style.display = view === 'ideas' ? 'block' : 'none';
      document.getElementById('pv-submit-view').style.display = view === 'submit' ? 'block' : 'none';
    });
  });

  // Load posts
  async function loadPosts() {
    try {
      const res = await fetch(baseUrl + '/api/widget/' + boardSlug);
      const data = await res.json();
      const view = document.getElementById('pv-ideas-view');

      if (!data.posts || data.posts.length === 0) {
        view.innerHTML = '<div class="pv-empty">No ideas yet. Be the first!</div>';
        return;
      }

      view.innerHTML = data.posts.map(post => {
        const sc = statusColors[post.status] || statusColors.open;
        const statusLabel = escapeHtml((post.status || 'open').replace('_', ' '));
        return `
          <div class="pv-post-item">
            <button class="pv-vote-btn" data-id="${post.id}" data-votes="${post.vote_count}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
              ${post.vote_count}
            </button>
            <div style="flex:1;min-width:0">
              <p class="pv-post-title">${escapeHtml(post.title)}</p>
              <span class="pv-post-status" style="background:${sc.bg};color:${sc.color}">${statusLabel}</span>
            </div>
          </div>
        `;
      }).join('');

      // Vote handlers
      view.querySelectorAll('.pv-vote-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const postId = btn.getAttribute('data-id');
          try {
            const res = await fetch(baseUrl + '/api/widget/' + boardSlug + '/vote/' + postId, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fingerprint: storedFp }),
            });
            const data = await res.json();
            btn.classList.add('voted');
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>${data.vote_count}`;
          } catch (e) {
            console.error('PatronVote: vote failed', e);
          }
        });
      });
    } catch (err) {
      document.getElementById('pv-ideas-view').innerHTML = '<div class="pv-empty">Could not load feedback.</div>';
    }
  }

  // Submit post
  document.getElementById('pv-submit').addEventListener('click', async () => {
    const title = document.getElementById('pv-title').value.trim();
    if (!title) {
      document.getElementById('pv-title').style.borderColor = '#ef4444';
      return;
    }

    const btn = document.getElementById('pv-submit');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
      await fetch(baseUrl + '/api/widget/' + boardSlug + '/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: document.getElementById('pv-desc').value.trim(),
          guest_name: document.getElementById('pv-name').value.trim(),
          guest_email: document.getElementById('pv-email').value.trim(),
          category: 'feature',
        }),
      });

      document.getElementById('pv-submit-view').innerHTML =
        '<div class="pv-success">✅ Thanks for your feedback!</div>';

      setTimeout(() => {
        panel.querySelector('[data-tab="ideas"]').click();
        loadPosts();
      }, 1500);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Submit Feedback';
    }
  });

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
})();

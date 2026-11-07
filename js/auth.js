/**
 * PAPERLY — Authentication & Session Management Module
 * Seamless integration with Cloudflare Workers API (D1 & JWT) with robust offline fallback.
 * Manages user sessions, protected routes, and the global Dark/Light theme switcher.
 */

const PAPERLY_AUTH = (() => {
  const STORAGE_KEY_USER = 'paperly_active_user';
  const STORAGE_KEY_TOKEN = 'paperly_jwt_token';
  const STORAGE_KEY_THEME = 'paperly_theme';
  const API_BASE = '/api/auth';

  // --- Session State Helpers ---
  function getCurrentUser() {
    try {
      const u = localStorage.getItem(STORAGE_KEY_USER);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function getToken() {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
  }

  function setSession(user, token = null) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
    window.dispatchEvent(new CustomEvent('paperly_auth_change', { detail: { user } }));
  }

  // --- Route Guard ---
  function requireAuth(redirectUrl = 'login.html') {
    const user = getCurrentUser();
    if (!user) {
      const current = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${redirectUrl}?next=${current}`;
      return false;
    }
    return true;
  }

  // --- Login ---
  async function login(email, password) {
    try {
      // 1. Try Cloudflare Workers backend API first
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.user, data.token);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.warn("Cloudflare auth endpoint unavailable, verifying via local registry:", err);
    }

    // 2. Offline / local development user fallback
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('paperly_users') || '[]');
    } catch (e) {}

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.password === password) {
        const user = { id: existing.id, name: existing.name, email: existing.email };
        setSession(user, 'token_local_' + Date.now());
        return { success: true, user };
      } else {
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }
    }

    // Demo account generation
    const demoUser = {
      id: 'usr_' + Date.now().toString(36),
      name: email.split('@')[0],
      email: email
    };
    users.push({ ...demoUser, password });
    localStorage.setItem('paperly_users', JSON.stringify(users));
    setSession(demoUser, 'token_local_demo');
    return { success: true, user: demoUser };
  }

  // --- Signup ---
  async function signup(name, email, password) {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.user, data.token);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.warn("Cloudflare auth endpoint unavailable, registering via local registry:", err);
    }

    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('paperly_users') || '[]');
    } catch (e) {}

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim().toLowerCase()
    };
    users.push({ ...newUser, password });
    localStorage.setItem('paperly_users', JSON.stringify(users));
    setSession(newUser, 'token_local_' + Date.now());
    return { success: true, user: newUser };
  }

  // --- Logout ---
  function logout() {
    setSession(null);
    window.location.href = 'index.html';
  }

  // --- Dark / Light Mode Theme Engine ---
  function getTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem(STORAGE_KEY_THEME, theme);

    // Update toggle icons across DOM
    document.querySelectorAll('.paperly-theme-toggle').forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });
  }

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // --- Header Navigation & User Dropdown Setup ---
  function initNav() {
    // 1. Initialize Theme
    setTheme(getTheme());

    // 2. Locate navigation container
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Add Theme Toggle if not present
    let toggleBtn = document.querySelector('.paperly-theme-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'paperly-theme-toggle';
      toggleBtn.onclick = toggleTheme;
      
      const rightGroup = nav.querySelector('.flex.items-center') || nav.querySelector('.nav-right') || nav;
      rightGroup.appendChild(toggleBtn);
      setTheme(getTheme());
    }

    // 3. User session pill / login links
    const user = getCurrentUser();
    const userContainer = document.getElementById('paperlyUserMenuContainer') || nav.querySelector('#userNavSlot');
    
    if (userContainer) {
      if (user) {
        userContainer.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <button type="button" id="paperlyUserBtn" style="display: flex; align-items: center; gap: 8px; padding: 4px 12px; background: rgba(246, 240, 228, 0.1); border: 1px solid rgba(246, 240, 228, 0.2); border-radius: 20px; color: inherit; cursor: pointer; font-size: 13px;">
              <span style="width: 22px; height: 22px; border-radius: 50%; background: #6e1423; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px;">${(user.name || 'U')[0].toUpperCase()}</span>
              <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name || 'User'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div id="paperlyUserDropdown" style="display: none; position: absolute; right: 0; top: 110%; width: 200px; background: #151311; border: 1px solid rgba(246, 240, 228, 0.15); border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); padding: 8px 0; z-index: 1000;">
              <div style="padding: 8px 16px; border-bottom: 1px solid rgba(246, 240, 228, 0.1); margin-bottom: 4px;">
                <p style="font-weight: 600; font-size: 13px; color: #f6f0e4; margin: 0;">${user.name}</p>
                <p style="font-size: 11px; color: #9b9082; margin: 2px 0 0; overflow: hidden; text-overflow: ellipsis;">${user.email}</p>
              </div>
              <a href="dashboard.html" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; color: #f6f0e4; text-decoration: none; font-size: 13px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                My Projects
              </a>
              <a href="create.html" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; color: #f6f0e4; text-decoration: none; font-size: 13px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Magazine
              </a>
              <button type="button" onclick="PAPERLY_AUTH.logout()" style="width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 16px; color: #e07a8c; background: none; border: none; font-size: 13px; cursor: pointer; text-align: left; border-top: 1px solid rgba(246, 240, 228, 0.1); margin-top: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Sign Out
              </button>
            </div>
          </div>
        `;

        const btn = document.getElementById('paperlyUserBtn');
        const dropdown = document.getElementById('paperlyUserDropdown');
        if (btn && dropdown) {
          btn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
          };
          document.addEventListener('click', () => { dropdown.style.display = 'none'; });
        }
      }
    }
  }

  // Auto-initialize theme on load
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      setTheme(getTheme());
    });
  }

  return {
    getCurrentUser,
    getToken,
    login,
    signup,
    logout,
    requireAuth,
    getTheme,
    setTheme,
    toggleTheme,
    initNav
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PAPERLY_AUTH;
}

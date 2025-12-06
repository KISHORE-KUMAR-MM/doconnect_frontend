(function () {
  const API = {
    auth: {
      login: 'http://localhost:8081/api/auth/login',
      register: 'http://localhost:8081/api/auth/register',
    },
    adminAuth: 'http://localhost:8082/api/admin/auth/login',
    questions: {
      approved: 'http://localhost:8083/api/question/approved',
      pending: 'http://localhost:8083/api/question/pending',
      search: (term) => `http://localhost:8083/api/question/search/${encodeURIComponent(term)}`,
      ask: 'http://localhost:8083/api/question/ask',
      get: (id) => `http://localhost:8083/api/question/get/${id}`,
      all: 'http://localhost:8083/api/question/all',
      approve: (id) => `http://localhost:8083/api/question/approve/${id}`,
      reject: (id) => `http://localhost:8083/api/question/reject/${id}`,
      update: (id) => `http://localhost:8083/api/question/update/${id}`,
      delete: (id) => `http://localhost:8083/api/question/delete/${id}`,
    },
    answers: {
      forQuestion: (id) => `http://localhost:8083/api/answers/question/${id}`,
      post: 'http://localhost:8083/api/answers/post',
      pending: 'http://localhost:8083/api/answers/pending',
      approve: (id) => `http://localhost:8083/api/answers/approve/${id}`,
      reject: (id) => `http://localhost:8083/api/answers/reject/${id}`,
    },
    users: {
      all: 'http://localhost:8081/api/users/all',
      toggle: (id) => `http://localhost:8081/api/users/status/${id}`,
    },
    chat: {
      history: (sessionId) => `http://localhost:8084/api/chat/history/${sessionId}`,
      userMessages: (username) => `http://localhost:8084/api/chat/user/${username}`,
      websocket: 'http://localhost:8084/ws',
    },
  };

  function showStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('hidden');
    element.classList.toggle('status-error', type === 'error');
    element.classList.toggle('status-success', type === 'success');
  }

  function hideStatus(element) {
    element?.classList.add('hidden');
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length)}…` : text;
  }

  function escapeHtml(value) {
    return (value || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async function fetchJson(url, fallback = null) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Request failed', error);
      return fallback;
    }
  }

  function safeParse(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function setButtonLoading(button, loading, loadingLabel = 'Loading...') {
    if (!button) return;
    const defaultLabel = button.dataset.defaultLabel || button.textContent;
    if (loading) {
      button.disabled = true;
      button.textContent = loadingLabel;
    } else {
      button.disabled = false;
      button.textContent = defaultLabel;
    }
  }

  // ======================================================
  // JWT TOKEN MANAGEMENT
  // ======================================================
  function getToken() {
    return localStorage.getItem('token') || null;
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  function isTokenValid(token) {
    if (!token) return false;
    try {
      // Decode JWT without verification (just to check expiration)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiration;
    } catch (error) {
      console.warn('Invalid token format:', error);
      return false;
    }
  }

  function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  // ======================================================
  // AUTHENTICATED FETCH FUNCTIONS
  // ======================================================
  async function fetchAuth(url, options = {}) {
    const token = getToken();
    
    // Validate token before making request
    if (!token || !isTokenValid(token)) {
      clearAuth();
      if (window.location.pathname !== '/frontend/index.html' && 
          window.location.pathname !== '/index.html') {
        window.location.href = './index.html';
      }
      throw new Error('Authentication required. Please log in again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      clearAuth();
      if (window.location.pathname !== '/frontend/index.html' && 
          window.location.pathname !== '/index.html') {
        window.location.href = './index.html';
      }
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  }

  async function fetchJsonAuth(url, fallback = null, options = {}) {
    try {
      const response = await fetchAuth(url, options);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error.message.includes('Authentication') || error.message.includes('Session expired')) {
        throw error; // Re-throw auth errors
      }
      console.warn('Request failed', error);
      return fallback;
    }
  }

  // ======================================================
  // USER MANAGEMENT
  // ======================================================
  function getCurrentUser() {
    const username = localStorage.getItem('username') || '';
    const user = safeParse(localStorage.getItem('user'));
    const role = localStorage.getItem('role') || '';
    const token = getToken();
    return { username, user, role, token };
  }

  function requireUser() {
    const { username, token } = getCurrentUser();
    
    // Check if token exists and is valid
    if (!token || !isTokenValid(token)) {
      clearAuth();
      window.location.href = './index.html';
      return null;
    }
    
    if (!username) {
      window.location.href = './index.html';
      return null;
    }
    
    return getCurrentUser();
  }

  function getCurrentAdmin() {
    const adminUsername = localStorage.getItem('adminUsername') || '';
    const admin = safeParse(localStorage.getItem('admin'));
    return { adminUsername, admin };
  }

  function requireAdmin() {
    const { adminUsername, admin } = getCurrentAdmin();
    if (!adminUsername) {
      window.location.href = './admin-login.html';
      return null;
    }
    return { adminUsername, admin };
  }

  function updateNavbarUser() {
    const { username } = getCurrentUser();
    const label = username || 'Guest';
    const chip = document.querySelector('[data-role="nav-username"]');
    const welcome = document.querySelector('[data-role="welcome-name"]');
    if (chip) chip.textContent = label;
    if (welcome) welcome.textContent = label;
  }

  function bindLogout() {
    const btn = document.querySelector('button[data-action="logout"]');
    if (!btn) return;
    if (!btn.dataset.defaultLabel) {
      btn.dataset.defaultLabel = btn.textContent.trim();
    }
    btn.addEventListener('click', () => {
      clearAuth();
      window.location.href = './index.html';
    });
  }

  window.DoConnect = {
    API,
    showStatus,
    hideStatus,
    formatDate,
    truncate,
    escapeHtml,
    fetchJson,
    fetchAuth,
    fetchJsonAuth,
    safeParse,
    setButtonLoading,
    getToken,
    setToken,
    isTokenValid,
    clearAuth,
    getCurrentUser,
    requireUser,
    getCurrentAdmin,
    requireAdmin,
    updateNavbarUser,
    bindLogout,
  };
})();



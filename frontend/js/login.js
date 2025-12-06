document.addEventListener('DOMContentLoaded', () => {
  const { API, showStatus, hideStatus, setButtonLoading } = window.DoConnect;

  const loginForm = document.getElementById('login-form');
  const loginError = document.querySelector('[data-role="login-error"]');
  const loginSubmit = document.querySelector('[data-role="login-submit"]');

  if (!loginForm) return;

  // Only redirect if user has both username and valid token
  const username = localStorage.getItem('username');
  const token = window.DoConnect?.getToken();
  if (username && token && window.DoConnect?.isTokenValid(token)) {
    window.location.href = './dashboard.html';
    return;
  }

  if (loginSubmit && !loginSubmit.dataset.defaultLabel) {
    loginSubmit.dataset.defaultLabel = loginSubmit.textContent.trim();
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideStatus(loginError);
    setButtonLoading(loginSubmit, true, 'Signing in...');
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(API.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('username', data.username || payload.username);
      if (data.role) {
        localStorage.setItem('role', data.role);
      }
      
      // Store token using the common.js function
      if (data.token) {
        window.DoConnect.setToken(data.token);
      }
      
      event.target.reset();
      window.location.href = './dashboard.html';
    } catch (error) {
      showStatus(loginError, error.message || 'Unable to sign in', 'error');
    } finally {
      setButtonLoading(loginSubmit, false);
    }
  });
});



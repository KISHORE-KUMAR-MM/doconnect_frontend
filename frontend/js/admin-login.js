document.addEventListener('DOMContentLoaded', () => {
  const { API, showStatus, hideStatus, setButtonLoading } = window.DoConnect;

  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.querySelector('[data-role="admin-login-error"]');
  const adminLoginSubmit = document.querySelector('[data-role="admin-login-submit"]');

  if (!adminLoginForm) return;

  if (localStorage.getItem('adminUsername')) {
    window.location.href = './admin-dashboard.html';
    return;
  }

  if (adminLoginSubmit && !adminLoginSubmit.dataset.defaultLabel) {
    adminLoginSubmit.dataset.defaultLabel = adminLoginSubmit.textContent.trim();
  }

  adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideStatus(adminLoginError);
    setButtonLoading(adminLoginSubmit, true, 'Signing in...');
    const payload = Object.fromEntries(new FormData(event.target).entries());

    try {
      const response = await fetch(API.adminAuth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Invalid admin credentials');
      }

      const data = await response.json();
      localStorage.setItem('admin', JSON.stringify(data));
      localStorage.setItem('adminUsername', payload.username);
      window.location.href = './admin-dashboard.html';
    } catch (error) {
      showStatus(adminLoginError, error.message || 'Unable to sign in', 'error');
    } finally {
      setButtonLoading(adminLoginSubmit, false);
    }
  });
});



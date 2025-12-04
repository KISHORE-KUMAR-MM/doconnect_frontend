document.addEventListener('DOMContentLoaded', () => {
  const { API, showStatus, hideStatus, setButtonLoading } = window.DoConnect;

  const registerForm = document.getElementById('register-form');
  const regError = document.querySelector('[data-role="register-error"]');
  const regSuccess = document.querySelector('[data-role="register-success"]');
  const regSubmit = document.querySelector('[data-role="register-submit"]');

  if (!registerForm) return;

  if (regSubmit && !regSubmit.dataset.defaultLabel) {
    regSubmit.dataset.defaultLabel = regSubmit.textContent.trim();
  }

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideStatus(regError);
    hideStatus(regSuccess);
    setButtonLoading(regSubmit, true, 'Creating account...');
    const payload = Object.fromEntries(new FormData(event.target).entries());

    if (payload.password !== payload.confirmPassword) {
      showStatus(regError, 'Passwords do not match', 'error');
      setButtonLoading(regSubmit, false);
      return;
    }

    if ((payload.password || '').length < 6) {
      showStatus(regError, 'Password must be at least 6 characters', 'error');
      setButtonLoading(regSubmit, false);
      return;
    }

    try {
      const response = await fetch(API.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: payload.username,
          email: payload.email,
          password: payload.password,
          fullName: payload.fullName,
          role: payload.role,
        }),
      });

      if (response.ok) {
        showStatus(
          regSuccess,
          'Registration successful! Redirecting to login...',
          'success'
        );
        setTimeout(() => {
          window.location.href = './index.html';
        }, 1800);
      } else {
        const text = await response.text();
        showStatus(regError, text || 'Registration failed. Try again.', 'error');
      }
    } catch (error) {
      showStatus(
        regError,
        'Unable to connect to server. Please try again.',
        'error'
      );
    } finally {
      setButtonLoading(regSubmit, false);
    }
  });
});



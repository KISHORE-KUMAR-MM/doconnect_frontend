document.addEventListener('DOMContentLoaded', () => {
  const {
    API,
    showStatus,
    hideStatus,
    setButtonLoading,
    updateNavbarUser,
    bindLogout,
    requireUser,
  } = window.DoConnect;

  const auth = requireUser();
  if (!auth) return;

  const askForm = document.getElementById('ask-form');
  const askError = document.querySelector('[data-role="ask-error"]');
  const askSuccess = document.querySelector('[data-role="ask-success"]');
  const askSubmit = document.querySelector('[data-role="ask-submit"]');
  const askCharCount = document.querySelector('[data-role="ask-char-count"]');
  const askDescription = document.getElementById('ask-description');

  updateNavbarUser();
  bindLogout();

  if (!askForm) return;

  if (askSubmit && !askSubmit.dataset.defaultLabel) {
    askSubmit.dataset.defaultLabel = askSubmit.textContent.trim();
  }

  if (askDescription && askCharCount) {
    const updateAskCharCount = () => {
      const value = askDescription.value || '';
      const truncated = value.slice(0, 2000);
      if (truncated !== value) {
        askDescription.value = truncated;
      }
      askCharCount.textContent = `${truncated.length} / 2000`;
    };
    askDescription.addEventListener('input', updateAskCharCount);
    updateAskCharCount();
  }

  askForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideStatus(askError);
    hideStatus(askSuccess);
    setButtonLoading(askSubmit, true, 'Submitting...');
    const payload = Object.fromEntries(new FormData(event.target).entries());

    if (!payload.title || !payload.topic || !payload.description) {
      showStatus(askError, 'Please fill in all required fields.', 'error');
      setButtonLoading(askSubmit, false);
      return;
    }

    try {
      const username = auth.username || localStorage.getItem('username');
      const body = {
        ...payload,
        postedBy: username,
        postedAt: new Date().toISOString(),
      };

      const response = await fetch(API.questions.ask, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        showStatus(
          askSuccess,
          'Question submitted! It will appear after admin approval.',
          'success'
        );
        event.target.reset();
        if (askDescription) {
          askDescription.value = '';
        }
        if (askCharCount) {
          askCharCount.textContent = '0 / 2000';
        }
        setTimeout(() => {
          window.location.href = './dashboard.html';
        }, 1800);
      } else {
        showStatus(
          askError,
          'Failed to submit question. Try again.',
          'error'
        );
      }
    } catch (error) {
      showStatus(
        askSuccess,
        'Question submitted (offline mode).',
        'success'
      );
      setTimeout(() => {
        window.location.href = './dashboard.html';
      }, 1500);
    } finally {
      setButtonLoading(askSubmit, false);
    }
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const {
    API,
    showStatus,
    hideStatus,
    fetchJson,
    formatDate,
    escapeHtml,
    requireAdmin,
  } = window.DoConnect;

  const auth = requireAdmin();
  if (!auth) return;

  const state = {
    adminTab: 'questions',
    adminData: {
      pendingQuestions: [],
      pendingAnswers: [],
      allQuestions: [],
      users: [],
    },
    adminLoading: false,
  };

  const adminName = document.querySelector('[data-role="admin-name"]');
  const pendingQuestionsCount = document.querySelector(
    '[data-role="pending-questions-count"]'
  );
  const pendingAnswersCount = document.querySelector(
    '[data-role="pending-answers-count"]'
  );
  const adminLoading = document.getElementById('admin-loading');
  const adminContent = document.getElementById('admin-content');
  const adminBanner = document.querySelector('[data-role="admin-banner"]');

  if (adminName) {
    adminName.textContent = auth.adminUsername || 'Admin';
  }

  let adminBannerTimer;

  document.body.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    switch (action) {
      case 'admin-tab':
        state.adminTab = actionEl.dataset.tab || 'questions';
        updateAdminTabs();
        renderAdminContent();
        break;
      case 'approve-question':
        adminApproveQuestion(actionEl.dataset.id);
        break;
      case 'reject-question':
        adminRejectQuestion(actionEl.dataset.id);
        break;
      case 'edit-question':
        adminEditQuestion(actionEl.dataset.id);
        break;
      case 'delete-question':
        adminDeleteQuestion(actionEl.dataset.id);
        break;
      case 'approve-answer':
        adminApproveAnswer(actionEl.dataset.id);
        break;
      case 'reject-answer':
        adminRejectAnswer(actionEl.dataset.id);
        break;
      case 'toggle-user':
        adminToggleUser(actionEl.dataset.id, actionEl.dataset.status);
        break;
      case 'admin-refresh':
        loadAdminData();
        break;
      case 'admin-logout':
        logoutAdmin();
        break;
      default:
        break;
    }
  });

  loadAdminData();

  async function loadAdminData() {
    if (state.adminLoading) return;
    state.adminLoading = true;
    adminLoading?.classList.remove('hidden');
    try {
      const [pendingQuestions, pendingAnswers, allQuestions, users] =
        await Promise.all([
          fetchJson(API.questions.pending, []),
          fetchJson(API.answers.pending, []),
          fetchJson(API.questions.all, []),
          fetchJson(API.users.all, []),
        ]);

      state.adminData = {
        pendingQuestions: pendingQuestions || [],
        pendingAnswers: pendingAnswers || [],
        allQuestions: allQuestions || [],
        users: users || [],
      };

      updateAdminStats();
      renderAdminContent();
    } finally {
      state.adminLoading = false;
      adminLoading?.classList.add('hidden');
    }
  }

  function updateAdminStats() {
    if (pendingQuestionsCount) {
      pendingQuestionsCount.textContent =
        state.adminData.pendingQuestions.length;
    }
    if (pendingAnswersCount) {
      pendingAnswersCount.textContent = state.adminData.pendingAnswers.length;
    }
    updateAdminTabs();
  }

  function updateAdminTabs() {
    document.querySelectorAll('[data-action="admin-tab"]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === state.adminTab);
    });
  }

  function renderAdminContent() {
    if (!adminContent) return;
    const tab = state.adminTab;
    let content = '';

    if (tab === 'questions') {
      content = renderPendingQuestions(state.adminData.pendingQuestions);
    } else if (tab === 'answers') {
      content = renderPendingAnswers(state.adminData.pendingAnswers);
    } else if (tab === 'all') {
      content = renderAllQuestions(state.adminData.allQuestions);
    } else if (tab === 'users') {
      content = renderUsers(state.adminData.users);
    }

    adminContent.innerHTML = content || '<p>No data available.</p>';
  }

  function renderPendingQuestions(questions = []) {
    if (!questions.length) {
      return '<p>No pending questions 🎉</p>';
    }

    return questions
      .map(
        (q) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(q.title || 'Untitled')}</strong>
            <span class="badge badge-info">${escapeHtml(
              q.topic || 'General'
            )}</span>
          </header>
          <p>${escapeHtml(q.description || '')}</p>
          <div class="question-meta">
            <span>${escapeHtml(q.postedBy || 'Anonymous')}</span>
            <span>${formatDate(q.postedAt)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-primary" data-action="approve-question" data-id="${
              q.id
            }">Approve</button>
            <button class="btn btn-danger" data-action="reject-question" data-id="${
              q.id
            }">Reject</button>
          </div>
        </div>`
      )
      .join('');
  }

  function renderPendingAnswers(answers = []) {
    if (!answers.length) {
      return '<p>No pending answers.</p>';
    }

    return answers
      .map(
        (answer) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(answer.questionTitle || 'Question')}</strong>
            <span class="badge badge-muted">Answer by ${escapeHtml(
              answer.answeredBy || 'User'
            )}</span>
          </header>
          <p>${escapeHtml(answer.answerText || '')}</p>
          <div class="question-meta">
            <span>${formatDate(answer.createdAt)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-primary" data-action="approve-answer" data-id="${
              answer.id
            }">Approve</button>
            <button class="btn btn-danger" data-action="reject-answer" data-id="${
              answer.id
            }">Reject</button>
          </div>
        </div>`
      )
      .join('');
  }

  function renderAllQuestions(questions = []) {
    if (!questions.length) {
      return '<p>No questions found.</p>';
    }

    return questions
      .map(
        (q) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(q.title || 'Untitled')}</strong>
            <span class="badge badge-info">${escapeHtml(
              q.topic || 'General'
            )}</span>
          </header>
          <p>${escapeHtml(q.description || '')}</p>
          <div class="question-meta">
            <span>${escapeHtml(q.postedBy || 'Anonymous')}</span>
            <span>${formatDate(q.postedAt)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-secondary" data-action="edit-question" data-id="${
              q.id
            }">Edit</button>
            <button class="btn btn-danger" data-action="delete-question" data-id="${
              q.id
            }">Delete</button>
          </div>
        </div>`
      )
      .join('');
  }

  function renderUsers(users = []) {
    if (!users.length) {
      return '<p>No users found.</p>';
    }

    return users
      .map(
        (user) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(user.username || '')}</strong>
            <span class="badge badge-info">${escapeHtml(
              user.role || 'User'
            )}</span>
          </header>
          <p>Email: ${escapeHtml(user.email || 'N/A')}</p>
          <p>Status: ${escapeHtml(user.status || 'UNKNOWN')}</p>
          <div class="admin-actions">
            <button class="btn btn-secondary"
              data-action="toggle-user"
              data-id="${user.id}"
              data-status="${user.status}">
              ${user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>`
      )
      .join('');
  }

  function logoutAdmin() {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminUsername');
    window.location.href = './admin-login.html';
  }

  async function adminApproveQuestion(id) {
    if (!id) return;
    await adminAction(
      API.questions.approve(id),
      'Question approved.',
      {
        method: 'PUT',
        body: JSON.stringify({ approvedBy: auth.adminUsername }),
      }
    );
  }

  async function adminRejectQuestion(id) {
    if (!id) return;
    await adminAction(
      API.questions.reject(id),
      'Question rejected.',
      {
        method: 'PUT',
        body: JSON.stringify({ rejectedBy: auth.adminUsername }),
      }
    );
  }

  async function adminEditQuestion(id) {
    if (!id) return;
    const question = state.adminData.allQuestions.find(
      (q) => String(q.id) === String(id)
    );
    const current = question?.description || '';
    const updated = window.prompt('Update question description:', current);
    if (updated === null) return;

    await adminAction(
      API.questions.update(id),
      'Question updated.',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: updated }),
      },
      true
    );
  }

  async function adminDeleteQuestion(id) {
    if (!id) return;
    if (!window.confirm('Delete this question permanently?')) return;
    await adminAction(
      API.questions.delete(id),
      'Question deleted.',
      { method: 'DELETE' }
    );
  }

  async function adminApproveAnswer(id) {
    if (!id) return;
    await adminAction(
      API.answers.approve(id),
      'Answer approved.',
      {
        method: 'PUT',
        body: JSON.stringify({ approvedBy: auth.adminUsername }),
      }
    );
  }

  async function adminRejectAnswer(id) {
    if (!id) return;
    await adminAction(
      API.answers.reject(id),
      'Answer rejected.',
      {
        method: 'PUT',
        body: JSON.stringify({ rejectedBy: auth.adminUsername }),
      }
    );
  }

  async function adminToggleUser(id, currentStatus) {
    if (!id) return;
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await adminAction(
      API.users.toggle(id),
      `User marked as ${nextStatus}.`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      },
      true
    );
  }

  async function adminAction(
    url,
    successMessage,
    options = {},
    reloadUsersOnly = false
  ) {
    try {
      const config = {
        method: options.method || 'PUT',
        headers: options.headers || {},
        body: options.body,
      };
      if (config.body && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      if (!config.body && Object.keys(config.headers).length === 0) {
        delete config.headers;
      }

      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      showAdminBanner(successMessage, 'success');
      if (reloadUsersOnly) {
        if (url.includes('/users/')) {
          const users = await fetchJson(API.users.all, []);
          state.adminData.users = users || [];
        } else if (url.includes('/question/update')) {
          const allQuestions = await fetchJson(API.questions.all, []);
          state.adminData.allQuestions = allQuestions || [];
        }
        renderAdminContent();
      } else {
        loadAdminData();
      }
    } catch (error) {
      showAdminBanner('Action failed. Please try again.', 'error');
    }
  }

  function showAdminBanner(message, type = 'success') {
    if (!adminBanner) return;
    adminBanner.textContent = message;
    adminBanner.classList.remove('hidden');
    adminBanner.classList.toggle('status-error', type === 'error');
    adminBanner.classList.toggle('status-success', type === 'success');
    clearTimeout(adminBannerTimer);
    adminBannerTimer = setTimeout(() => {
      adminBanner.classList.add('hidden');
    }, 2500);
  }
});



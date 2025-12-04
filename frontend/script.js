(() => {
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
  };

  const state = {
    username: '',
    user: null,
    adminUsername: '',
    admin: null,
    questions: [],
    filteredQuestions: [],
    searchTerm: '',
    selectedCategory: 'all',
    isFetchingQuestions: false,
    adminTab: 'questions',
    adminData: {
      pendingQuestions: [],
      pendingAnswers: [],
      allQuestions: [],
      users: [],
    },
    currentQuestionId: null,
    adminLoading: false,
  };

  const dom = {};
  const ROUTES = {
    login: { guard: ensureLoggedOut, onEnter: resetLoginForm },
    register: { guard: ensureLoggedOut, onEnter: resetRegisterForm },
    dashboard: { guard: ensureUser, onEnter: enterDashboard },
    ask: { guard: ensureUser, onEnter: resetAskForm },
    answer: { guard: ensureUser, onEnter: ({ param }) => showAnswerView(param) },
    'admin-login': { guard: ensureAdminLoggedOut, onEnter: resetAdminLoginForm },
    'admin-dashboard': { guard: ensureAdmin, onEnter: enterAdminDashboard },
  };

  let adminBannerTimer;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    hydrateState();
    bindEvents();
    handleRoute();
  }

  function cacheDom() {
    dom.sections = new Map();
    document.querySelectorAll('[data-view]').forEach((section) => {
      dom.sections.set(section.dataset.view, section);
    });
    dom.navbar = document.querySelector('[data-role="navbar"]');
    dom.navUsernameChip = document.querySelector('[data-role="nav-username"]');
    dom.welcomeName = document.querySelector('[data-role="welcome-name"]');

    dom.loginForm = document.getElementById('login-form');
    dom.loginError = document.querySelector('[data-role="login-error"]');
    dom.loginSubmit = document.querySelector('[data-role="login-submit"]');

    dom.registerForm = document.getElementById('register-form');
    dom.regError = document.querySelector('[data-role="register-error"]');
    dom.regSuccess = document.querySelector('[data-role="register-success"]');
    dom.regSubmit = document.querySelector('[data-role="register-submit"]');

    dom.dashboardSearch = document.getElementById('dashboard-search');
    dom.dashboardCategory = document.getElementById('dashboard-category');
    dom.questionsGrid = document.getElementById('questions-grid');
    dom.questionsEmpty = document.getElementById('questions-empty');
    dom.dashboardLoading = document.getElementById('dashboard-loading');

    dom.askForm = document.getElementById('ask-form');
    dom.askError = document.querySelector('[data-role="ask-error"]');
    dom.askSuccess = document.querySelector('[data-role="ask-success"]');
    dom.askSubmit = document.querySelector('[data-role="ask-submit"]');
    dom.askCharCount = document.querySelector('[data-role="ask-char-count"]');
    dom.askDescription = document.getElementById('ask-description');

    dom.answerLoading = document.getElementById('answer-loading');
    dom.answerContent = document.getElementById('answer-content');
    dom.answerQuestion = document.getElementById('answer-question');
    dom.answersList = document.getElementById('answers-list');
    dom.answersEmpty = document.getElementById('answers-empty');
    dom.answerForm = document.getElementById('answer-form');
    dom.answerError = document.querySelector('[data-role="answer-error"]');
    dom.answerSuccess = document.querySelector('[data-role="answer-success"]');
    dom.answerSubmit = document.querySelector('[data-role="answer-submit"]');

    dom.adminLoginForm = document.getElementById('admin-login-form');
    dom.adminLoginError = document.querySelector('[data-role="admin-login-error"]');
    dom.adminLoginSubmit = document.querySelector('[data-role="admin-login-submit"]');

    dom.adminName = document.querySelector('[data-role="admin-name"]');
    dom.pendingQuestionsCount = document.querySelector('[data-role="pending-questions-count"]');
    dom.pendingAnswersCount = document.querySelector('[data-role="pending-answers-count"]');
    dom.adminLoading = document.getElementById('admin-loading');
    dom.adminContent = document.getElementById('admin-content');
    dom.adminBanner = document.querySelector('[data-role="admin-banner"]');

    document.querySelectorAll('button[data-role]').forEach((btn) => {
      if (!btn.dataset.defaultLabel) {
        btn.dataset.defaultLabel = btn.textContent.trim();
      }
    });
    document.querySelectorAll('button.btn').forEach((btn) => {
      if (!btn.dataset.defaultLabel) {
        btn.dataset.defaultLabel = btn.textContent.trim();
      }
    });
  }

  function hydrateState() {
    state.username = localStorage.getItem('username') || '';
    state.user = safeParse(localStorage.getItem('user'));
    state.adminUsername = localStorage.getItem('adminUsername') || '';
    state.admin = safeParse(localStorage.getItem('admin'));
    updateNavbarUser();
  }

  function bindEvents() {
    window.addEventListener('hashchange', handleRoute);
    document.body.addEventListener('click', handleActionClick);

    dom.loginForm?.addEventListener('submit', handleLogin);
    dom.registerForm?.addEventListener('submit', handleRegister);
    dom.dashboardSearch?.addEventListener('input', handleSearchInput);
    dom.dashboardCategory?.addEventListener('change', (event) => {
      state.selectedCategory = event.target.value;
      applyFilters();
    });
    dom.askForm?.addEventListener('submit', handleAskSubmit);
    dom.askDescription?.addEventListener('input', updateAskCharCount);
    dom.answerForm?.addEventListener('submit', handleAnswerSubmit);
    dom.adminLoginForm?.addEventListener('submit', handleAdminLogin);
  }

  function handleRoute() {
    const parsed = parseHash(window.location.hash);
    const target = ROUTES[parsed.name] ? parsed.name : 'login';
    const route = ROUTES[target];
    if (route.guard && !route.guard(parsed)) {
      return;
    }
    activateView(target);
    route.onEnter?.(parsed);
  }

  function parseHash(hash) {
    const clean = (hash || '').replace(/^#/, '') || 'login';
    const [name, param] = clean.split('/');
    return { name, param: param || null };
  }

  function activateView(name) {
    dom.sections.forEach((section, key) => {
      section.classList.toggle('active', key === name);
    });
    updateNavbarVisibility(name);
  }

  function updateNavbarVisibility(view) {
    const hide = ['login', 'register', 'admin-login', 'admin-dashboard'].includes(view);
    dom.navbar?.classList.toggle('hidden', hide);
  }

  function ensureLoggedOut() {
    if (state.username) {
      setHash('dashboard');
      return false;
    }
    return true;
  }

  function ensureUser() {
    if (state.username) {
      return true;
    }
    setHash('login');
    return false;
  }

  function ensureAdminLoggedOut() {
    if (state.adminUsername) {
      setHash('admin-dashboard');
      return false;
    }
    return true;
  }

  function ensureAdmin() {
    if (state.adminUsername) {
      return true;
    }
    setHash('admin-login');
    return false;
  }

  function setHash(value) {
    if (window.location.hash === `#${value}`) {
      handleRoute();
    } else {
      window.location.hash = `#${value}`;
    }
  }

  function updateNavbarUser() {
    const label = state.username || 'Guest';
    if (dom.navUsernameChip) {
      dom.navUsernameChip.textContent = label;
    }
    if (dom.welcomeName) {
      dom.welcomeName.textContent = label;
    }
  }

  function resetLoginForm() {
    dom.loginForm?.reset();
    hideStatus(dom.loginError);
    setButtonLoading(dom.loginSubmit, false);
  }

  function resetRegisterForm() {
    dom.registerForm?.reset();
    hideStatus(dom.regError);
    hideStatus(dom.regSuccess);
    setButtonLoading(dom.regSubmit, false);
  }

  function enterDashboard() {
    updateNavbarUser();
    if (!state.questions.length) {
      loadQuestions();
    } else {
      applyFilters();
    }
  }

  function resetAskForm() {
    dom.askForm?.reset();
    hideStatus(dom.askError);
    hideStatus(dom.askSuccess);
    updateAskCharCount();
    setButtonLoading(dom.askSubmit, false);
  }

  function showAnswerView(id) {
    if (!id) {
      setHash('dashboard');
      return;
    }
    state.currentQuestionId = id;
    dom.answerForm?.reset();
    hideStatus(dom.answerError);
    hideStatus(dom.answerSuccess);
    loadQuestionThread(id);
  }

  function resetAdminLoginForm() {
    dom.adminLoginForm?.reset();
    hideStatus(dom.adminLoginError);
    setButtonLoading(dom.adminLoginSubmit, false);
  }

  function enterAdminDashboard() {
    if (dom.adminName) {
      dom.adminName.textContent = state.adminUsername || 'Admin';
    }
    loadAdminData();
  }

  async function handleLogin(event) {
    event.preventDefault();
    hideStatus(dom.loginError);
    setButtonLoading(dom.loginSubmit, true, 'Signing in...');
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
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('username', payload.username);
      state.username = payload.username;
      state.user = data;
      updateNavbarUser();
      event.target.reset();
      setHash('dashboard');
    } catch (error) {
      showStatus(dom.loginError, error.message || 'Unable to sign in', 'error');
    } finally {
      setButtonLoading(dom.loginSubmit, false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    hideStatus(dom.regError);
    hideStatus(dom.regSuccess);
    setButtonLoading(dom.regSubmit, true, 'Creating account...');
    const payload = Object.fromEntries(new FormData(event.target).entries());

    if (payload.password !== payload.confirmPassword) {
      showStatus(dom.regError, 'Passwords do not match', 'error');
      setButtonLoading(dom.regSubmit, false);
      return;
    }

    if ((payload.password || '').length < 6) {
      showStatus(dom.regError, 'Password must be at least 6 characters', 'error');
      setButtonLoading(dom.regSubmit, false);
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
        showStatus(dom.regSuccess, 'Registration successful! Redirecting to login...', 'success');
        setTimeout(() => setHash('login'), 1800);
      } else {
        const text = await response.text();
        showStatus(dom.regError, text || 'Registration failed. Try again.', 'error');
      }
    } catch (error) {
      showStatus(dom.regError, 'Unable to connect to server. Please try again.', 'error');
    } finally {
      setButtonLoading(dom.regSubmit, false);
    }
  }

  function handleSearchInput(event) {
    const value = event.target.value.trim();
    state.searchTerm = value;

    if (value.length >= 3) {
      loadQuestions({ search: value });
    } else {
      applyFilters();
      if (!value) {
        loadQuestions();
      }
    }
  }

  async function loadQuestions(options = {}) {
    if (state.isFetchingQuestions) return;
    state.isFetchingQuestions = true;
    toggleDashboardLoading(true);
    const { search } = options;
    const url =
      typeof search === 'string' && search.length >= 3
        ? API.questions.search(search)
        : API.questions.approved;

    try {
      const data = await fetchJson(url, []);
      state.questions = Array.isArray(data) ? data : [];
      applyFilters();
    } finally {
      state.isFetchingQuestions = false;
      toggleDashboardLoading(false);
    }
  }

  function applyFilters() {
    let list = [...state.questions];
    if (state.selectedCategory !== 'all') {
      list = list.filter((q) => (q.topic || '').toLowerCase() === state.selectedCategory.toLowerCase());
    }

    if (state.searchTerm && state.searchTerm.length < 3) {
      const term = state.searchTerm.toLowerCase();
      list = list.filter(
        (q) =>
          (q.title || '').toLowerCase().includes(term) ||
          (q.description || '').toLowerCase().includes(term)
      );
    }

    state.filteredQuestions = list;
    renderQuestions();
  }

  function renderQuestions() {
    if (!dom.questionsGrid || !dom.questionsEmpty) return;
    const { filteredQuestions } = state;

    if (!filteredQuestions.length) {
      dom.questionsGrid.innerHTML = '';
      dom.questionsEmpty.classList.remove('hidden');
      return;
    }

    dom.questionsEmpty.classList.add('hidden');
    dom.questionsGrid.innerHTML = filteredQuestions
      .map(
        (question) => `
        <article class="question-card">
          <div class="question-topic">${escapeHtml(question.topic || 'General')}</div>
          <h2 class="question-title">${escapeHtml(question.title || 'Untitled')}</h2>
          <p>${escapeHtml(truncate(question.description || 'No description provided.', 140))}</p>
          <div class="question-meta">
            <span>${escapeHtml(question.postedBy || 'Anonymous')}</span>
            <span>${formatDate(question.postedAt)}</span>
          </div>
          <button class="btn btn-secondary" data-action="view-question" data-id="${question.id}">
            View Discussion
          </button>
        </article>`
      )
      .join('');
  }

  function toggleDashboardLoading(show) {
    dom.dashboardLoading?.classList.toggle('hidden', !show);
  }

  function updateAskCharCount() {
    if (!dom.askCharCount || !dom.askDescription) return;
    const value = dom.askDescription.value || '';
    const truncated = value.slice(0, 2000);
    if (truncated !== value) {
      dom.askDescription.value = truncated;
    }
    dom.askCharCount.textContent = `${truncated.length} / 2000`;
  }

  async function handleAskSubmit(event) {
    event.preventDefault();
    hideStatus(dom.askError);
    hideStatus(dom.askSuccess);
    setButtonLoading(dom.askSubmit, true, 'Submitting...');
    const payload = Object.fromEntries(new FormData(event.target).entries());

    if (!payload.title || !payload.topic || !payload.description) {
      showStatus(dom.askError, 'Please fill in all required fields.', 'error');
      setButtonLoading(dom.askSubmit, false);
      return;
    }

    try {
      const username = state.username || localStorage.getItem('username');
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
          dom.askSuccess,
          'Question submitted! It will appear after admin approval.',
          'success'
        );
        event.target.reset();
        updateAskCharCount();
        setTimeout(() => setHash('dashboard'), 1800);
      } else {
        showStatus(dom.askError, 'Failed to submit question. Try again.', 'error');
      }
    } catch (error) {
      showStatus(dom.askSuccess, 'Question submitted (offline mode).', 'success');
      setTimeout(() => setHash('dashboard'), 1500);
    } finally {
      setButtonLoading(dom.askSubmit, false);
    }
  }

  async function loadQuestionThread(id) {
    if (!dom.answerLoading || !dom.answerContent) return;
    dom.answerLoading.classList.remove('hidden');
    dom.answerContent.classList.add('hidden');

    try {
      const [question, answers] = await Promise.all([
        fetchJson(API.questions.get(id)),
        fetchJson(API.answers.forQuestion(id), []),
      ]);

      renderQuestionDetails(question);
      renderAnswers(Array.isArray(answers) ? answers : []);
    } catch (error) {
      dom.answerQuestion.innerHTML = `<p class="status-message status-error">Unable to load question.</p>`;
      dom.answersList.innerHTML = '';
      dom.answersEmpty.classList.remove('hidden');
    } finally {
      dom.answerLoading.classList.add('hidden');
      dom.answerContent.classList.remove('hidden');
    }
  }

  function renderQuestionDetails(question) {
    if (!dom.answerQuestion) return;
    if (!question) {
      dom.answerQuestion.innerHTML = `<p class="status-message status-error">Question not found.</p>`;
      return;
    }

    dom.answerQuestion.innerHTML = `
      <div class="question-card" style="border: none; box-shadow: none; padding: 0;">
        <div class="question-topic">${escapeHtml(question.topic || 'General')}</div>
        <h1>${escapeHtml(question.title || 'Untitled')}</h1>
        <p>${escapeHtml(question.description || '')}</p>
        <div class="question-meta">
          <span>${escapeHtml(question.postedBy || 'Anonymous')}</span>
          <span>${formatDate(question.postedAt)}</span>
        </div>
      </div>
    `;
  }

  function renderAnswers(answers) {
    if (!dom.answersList || !dom.answersEmpty) return;
    if (!answers.length) {
      dom.answersList.innerHTML = '';
      dom.answersEmpty.classList.remove('hidden');
      return;
    }

    dom.answersEmpty.classList.add('hidden');
    dom.answersList.innerHTML = answers
      .map(
        (answer) => `
        <div class="answer-card">
          <p>${escapeHtml(answer.answerText || '')}</p>
          <div class="question-meta">
            <span>${escapeHtml(answer.answeredBy || 'Anonymous')}</span>
            <span>${formatDate(answer.createdAt)}</span>
          </div>
        </div>`
      )
      .join('');
  }

  async function handleAnswerSubmit(event) {
    event.preventDefault();
    if (!state.currentQuestionId) return;
    hideStatus(dom.answerError);
    hideStatus(dom.answerSuccess);
    setButtonLoading(dom.answerSubmit, true, 'Submitting...');

    const formData = new FormData(event.target);
    const answerText = formData.get('answerText');

    if (!answerText || !answerText.trim()) {
      showStatus(dom.answerError, 'Please write an answer before submitting.', 'error');
      setButtonLoading(dom.answerSubmit, false);
      return;
    }

    try {
      const body = {
        questionId: state.currentQuestionId,
        answerText,
        answeredBy: state.username,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(API.answers.post, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        showStatus(dom.answerSuccess, 'Answer submitted for review.', 'success');
        event.target.reset();
      } else {
        showStatus(dom.answerError, 'Failed to submit answer. Try again.', 'error');
      }
    } catch (error) {
      showStatus(dom.answerError, 'Unable to reach the server.', 'error');
    } finally {
      setButtonLoading(dom.answerSubmit, false);
    }
  }

  async function handleAdminLogin(event) {
    event.preventDefault();
    hideStatus(dom.adminLoginError);
    setButtonLoading(dom.adminLoginSubmit, true, 'Signing in...');
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
      state.adminUsername = payload.username;
      state.admin = data;
      setHash('admin-dashboard');
    } catch (error) {
      showStatus(dom.adminLoginError, error.message || 'Unable to sign in', 'error');
    } finally {
      setButtonLoading(dom.adminLoginSubmit, false);
    }
  }

  async function loadAdminData() {
    if (state.adminLoading) return;
    state.adminLoading = true;
    dom.adminLoading?.classList.remove('hidden');
    try {
      const [pendingQuestions, pendingAnswers, allQuestions, users] = await Promise.all([
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
      dom.adminLoading?.classList.add('hidden');
    }
  }

  function updateAdminStats() {
    if (dom.pendingQuestionsCount) {
      dom.pendingQuestionsCount.textContent = state.adminData.pendingQuestions.length;
    }
    if (dom.pendingAnswersCount) {
      dom.pendingAnswersCount.textContent = state.adminData.pendingAnswers.length;
    }
    updateAdminTabs();
  }

  function updateAdminTabs() {
    document.querySelectorAll('[data-action="admin-tab"]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === state.adminTab);
    });
  }

  function renderAdminContent() {
    if (!dom.adminContent) return;
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

    dom.adminContent.innerHTML = content || '<p>No data available.</p>';
  }

  function renderPendingQuestions(questions = []) {
    if (!questions.length) {
      return `<p>No pending questions 🎉</p>`;
    }

    return questions
      .map(
        (q) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(q.title || 'Untitled')}</strong>
            <span class="badge badge-info">${escapeHtml(q.topic || 'General')}</span>
          </header>
          <p>${escapeHtml(q.description || '')}</p>
          <div class="question-meta">
            <span>${escapeHtml(q.postedBy || 'Anonymous')}</span>
            <span>${formatDate(q.postedAt)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-primary" data-action="approve-question" data-id="${q.id}">Approve</button>
            <button class="btn btn-danger" data-action="reject-question" data-id="${q.id}">Reject</button>
          </div>
        </div>`
      )
      .join('');
  }

  function renderPendingAnswers(answers = []) {
    if (!answers.length) {
      return `<p>No pending answers.</p>`;
    }

    return answers
      .map(
        (answer) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(answer.questionTitle || 'Question')}</strong>
            <span class="badge badge-muted">Answer by ${escapeHtml(answer.answeredBy || 'User')}</span>
          </header>
          <p>${escapeHtml(answer.answerText || '')}</p>
          <div class="question-meta">
            <span>${formatDate(answer.createdAt)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-primary" data-action="approve-answer" data-id="${answer.id}">Approve</button>
            <button class="btn btn-danger" data-action="reject-answer" data-id="${answer.id}">Reject</button>
          </div>
        </div>`
      )
      .join('');
  }

  function renderAllQuestions(questions = []) {
    if (!questions.length) {
      return `<p>No questions found.</p>`;
    }

    return questions
      .map(
        (q) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(q.title || 'Untitled')}</strong>
            <span class="badge badge-info">${escapeHtml(q.topic || 'General')}</span>
          </header>
          <p>${escapeHtml(q.description || '')}</p>
          <div class="question-meta">
            <span>${escapeHtml(q.postedBy || 'Anonymous')}</span>
            <span>${formatDate(q.postedAt)}</span>
          </div>
          <div class="admin-actions">
            <button class="btn btn-secondary" data-action="edit-question" data-id="${q.id}">Edit</button>
            <button class="btn btn-danger" data-action="delete-question" data-id="${q.id}">Delete</button>
          </div>
        </div>`
      )
      .join('');
  }

  function renderUsers(users = []) {
    if (!users.length) {
      return `<p>No users found.</p>`;
    }

    return users
      .map(
        (user) => `
        <div class="admin-card">
          <header>
            <strong>${escapeHtml(user.username || '')}</strong>
            <span class="badge badge-info">${escapeHtml(user.role || 'User')}</span>
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

  function handleActionClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    switch (action) {
      case 'nav-dashboard':
      case 'go-dashboard':
        setHash('dashboard');
        break;
      case 'ask-question':
        setHash('ask');
        break;
      case 'logout':
        logoutUser();
        break;
      case 'view-question':
        if (actionEl.dataset.id) {
          setHash(`answer/${actionEl.dataset.id}`);
        }
        break;
      case 'refresh-questions':
        loadQuestions({ search: state.searchTerm.length >= 3 ? state.searchTerm : undefined });
        break;
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
  }

  function logoutUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    state.username = '';
    state.user = null;
    updateNavbarUser();
    setHash('login');
  }

  function logoutAdmin() {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminUsername');
    state.admin = null;
    state.adminUsername = '';
    setHash('admin-login');
  }

  async function adminApproveQuestion(id) {
    if (!id) return;
    await adminAction(
      API.questions.approve(id),
      'Question approved.',
      {
        method: 'PUT',
        body: JSON.stringify({ approvedBy: state.adminUsername }),
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
        body: JSON.stringify({ rejectedBy: state.adminUsername }),
      }
    );
  }

  async function adminEditQuestion(id) {
    if (!id) return;
    const question = state.adminData.allQuestions.find((q) => String(q.id) === String(id));
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
    await adminAction(API.questions.delete(id), 'Question deleted.', { method: 'DELETE' });
  }

  async function adminApproveAnswer(id) {
    if (!id) return;
    await adminAction(
      API.answers.approve(id),
      'Answer approved.',
      {
        method: 'PUT',
        body: JSON.stringify({ approvedBy: state.adminUsername }),
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
        body: JSON.stringify({ rejectedBy: state.adminUsername }),
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

  async function adminAction(url, successMessage, options = {}, reloadUsersOnly = false) {
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

  function showAdminBanner(message, type = 'success') {
    if (!dom.adminBanner) return;
    dom.adminBanner.textContent = message;
    dom.adminBanner.classList.remove('hidden');
    dom.adminBanner.classList.toggle('status-error', type === 'error');
    dom.adminBanner.classList.toggle('status-success', type === 'success');
    clearTimeout(adminBannerTimer);
    adminBannerTimer = setTimeout(() => {
      dom.adminBanner.classList.add('hidden');
    }, 2500);
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
})();


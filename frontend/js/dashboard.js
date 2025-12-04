document.addEventListener('DOMContentLoaded', () => {
  const {
    API,
    truncate,
    escapeHtml,
    formatDate,
    fetchJson,
    updateNavbarUser,
    bindLogout,
    requireUser,
  } = window.DoConnect;

  const auth = requireUser();
  if (!auth) return;

  const state = {
    questions: [],
    filteredQuestions: [],
    searchTerm: '',
    selectedCategory: 'all',
    isFetchingQuestions: false,
  };

  const dashboardSearch = document.getElementById('dashboard-search');
  const dashboardCategory = document.getElementById('dashboard-category');
  const questionsGrid = document.getElementById('questions-grid');
  const questionsEmpty = document.getElementById('questions-empty');
  const dashboardLoading = document.getElementById('dashboard-loading');

  updateNavbarUser();
  bindLogout();

  const refreshBtn = document.querySelector(
    'button[data-action="refresh-questions"]'
  );
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadQuestions({
        search: state.searchTerm.length >= 3 ? state.searchTerm : undefined,
      });
    });
  }

  if (dashboardSearch) {
    dashboardSearch.addEventListener('input', (event) => {
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
    });
  }

  if (dashboardCategory) {
    dashboardCategory.addEventListener('change', (event) => {
      state.selectedCategory = event.target.value;
      applyFilters();
    });
  }

  questionsGrid?.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-id]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    window.location.href = `./answer.html?id=${encodeURIComponent(id)}`;
  });

  loadQuestions();

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
      list = list.filter(
        (q) =>
          (q.topic || '').toLowerCase() ===
          state.selectedCategory.toLowerCase()
      );
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
    if (!questionsGrid || !questionsEmpty) return;
    const { filteredQuestions } = state;

    if (!filteredQuestions.length) {
      questionsGrid.innerHTML = '';
      questionsEmpty.classList.remove('hidden');
      return;
    }

    questionsEmpty.classList.add('hidden');
    questionsGrid.innerHTML = filteredQuestions
      .map(
        (question) => `
        <article class="question-card">
          <div class="question-topic">${escapeHtml(
            question.topic || 'General'
          )}</div>
          <h2 class="question-title">${escapeHtml(
            question.title || 'Untitled'
          )}</h2>
          <p>${escapeHtml(
            truncate(
              question.description || 'No description provided.',
              140
            )
          )}</p>
          <div class="question-meta">
            <span>${escapeHtml(question.postedBy || 'Anonymous')}</span>
            <span>${formatDate(question.postedAt)}</span>
          </div>
          <button class="btn btn-secondary" data-id="${question.id}">
            View Discussion
          </button>
        </article>`
      )
      .join('');
  }

  function toggleDashboardLoading(show) {
    dashboardLoading?.classList.toggle('hidden', !show);
  }
});



document.addEventListener('DOMContentLoaded', () => {
  const {
    API,
    showStatus,
    hideStatus,
    setButtonLoading,
    formatDate,
    escapeHtml,
    fetchJson,
    updateNavbarUser,
    bindLogout,
    requireUser,
  } = window.DoConnect;

  const auth = requireUser();
  if (!auth) return;

  const params = new URLSearchParams(window.location.search);
  const questionId = params.get('id');
  if (!questionId) {
    window.location.href = './dashboard.html';
    return;
  }

  const answerLoading = document.getElementById('answer-loading');
  const answerContent = document.getElementById('answer-content');
  const answerQuestion = document.getElementById('answer-question');
  const answersList = document.getElementById('answers-list');
  const answersEmpty = document.getElementById('answers-empty');
  const answerForm = document.getElementById('answer-form');
  const answerError = document.querySelector('[data-role="answer-error"]');
  const answerSuccess = document.querySelector('[data-role="answer-success"]');
  const answerSubmit = document.querySelector('[data-role="answer-submit"]');

  updateNavbarUser();
  bindLogout();

  if (answerSubmit && !answerSubmit.dataset.defaultLabel) {
    answerSubmit.dataset.defaultLabel = answerSubmit.textContent.trim();
  }

  loadQuestionThread(questionId);

  if (answerForm) {
    answerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideStatus(answerError);
      hideStatus(answerSuccess);
      setButtonLoading(answerSubmit, true, 'Submitting...');

      const formData = new FormData(event.target);
      const answerText = formData.get('answerText');

      if (!answerText || !answerText.trim()) {
        showStatus(
          answerError,
          'Please write an answer before submitting.',
          'error'
        );
        setButtonLoading(answerSubmit, false);
        return;
      }

      try {
        const body = {
          questionId,
          answerText,
          answeredBy: auth.username,
          createdAt: new Date().toISOString(),
        };

        const response = await fetch(API.answers.post, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          showStatus(
            answerSuccess,
            'Answer submitted for review.',
            'success'
          );
          event.target.reset();
        } else {
          showStatus(
            answerError,
            'Failed to submit answer. Try again.',
            'error'
          );
        }
      } catch (error) {
        showStatus(answerError, 'Unable to reach the server.', 'error');
      } finally {
        setButtonLoading(answerSubmit, false);
      }
    });
  }

  async function loadQuestionThread(id) {
    if (!answerLoading || !answerContent) return;
    answerLoading.classList.remove('hidden');
    answerContent.classList.add('hidden');

    try {
      const [question, answers] = await Promise.all([
        fetchJson(API.questions.get(id)),
        fetchJson(API.answers.forQuestion(id), []),
      ]);

      renderQuestionDetails(question);
      renderAnswers(Array.isArray(answers) ? answers : []);
    } catch (error) {
      if (answerQuestion) {
        answerQuestion.innerHTML =
          '<p class="status-message status-error">Unable to load question.</p>';
      }
      if (answersList) {
        answersList.innerHTML = '';
      }
      if (answersEmpty) {
        answersEmpty.classList.remove('hidden');
      }
    } finally {
      answerLoading.classList.add('hidden');
      answerContent.classList.remove('hidden');
    }
  }

  function renderQuestionDetails(question) {
    if (!answerQuestion) return;
    if (!question) {
      answerQuestion.innerHTML =
        '<p class="status-message status-error">Question not found.</p>';
      return;
    }

    answerQuestion.innerHTML = `
      <div class="question-card" style="border: none; box-shadow: none; padding: 0;">
        <div class="question-topic">${escapeHtml(
          question.topic || 'General'
        )}</div>
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
    if (!answersList || !answersEmpty) return;
    if (!answers.length) {
      answersList.innerHTML = '';
      answersEmpty.classList.remove('hidden');
      return;
    }

    answersEmpty.classList.add('hidden');
    answersList.innerHTML = answers
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
});



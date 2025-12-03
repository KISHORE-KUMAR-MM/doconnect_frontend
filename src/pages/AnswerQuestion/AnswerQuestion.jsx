import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import './AnswerQuestion.css';

function AnswerQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  // Load question + approved answers
  const fetchQuestionAndAnswers = async () => {
    try {
      // Fetch Question
      const questionRes = await fetch(`http://localhost:8083/api/question/get/${id}`);
      if (questionRes.ok) {
        setQuestion(await questionRes.json());
      } else {
        setQuestion(null);
      }

      // Fetch Approved Answers
      const answersRes = await fetch(`http://localhost:8083/api/answers/question/${id}`);
      if (answersRes.ok) {
        setAnswers(await answersRes.json());
      } else {
        setAnswers([]);
      }
    } catch (err) {
      setQuestion(null);
      setAnswers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Submit Answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!answerText.trim()) {
      setError('Please write an answer before submitting');
      return;
    }

    setSubmitting(true);

    try {
      const username = localStorage.getItem('username');

      const answerBody = {
        questionId: id,
        answerText: answerText,
        answeredBy: username,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:8083/api/answers/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerBody)
      });

      if (response.ok) {
        setSuccess('Answer submitted! It will be visible after admin approval.');
        setAnswerText('');
      } else {
        setError('Failed to submit answer. Please try again.');
      }
    } catch (err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="answer-question-page">
        <Navbar />
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="answer-question-page">
      <Navbar />

      <main className="answer-question-main">
        <div className="answer-question-container">

          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Questions
          </button>

          {/* Question Section */}
          {question && (
            <div className="question-detail">
              <div className="question-header">
                <span className="question-topic">{question.topic}</span>
                <span className="question-date">{formatDate(question.postedAt)}</span>
              </div>

              <h1 className="question-title">{question.title}</h1>
              <p className="question-text">{question.description}</p>

              <div className="question-author">
                <div className="author-avatar">
                  {question.postedBy?.charAt(0).toUpperCase()}
                </div>
                <div className="author-info">
                  <span className="author-name">{question.postedBy}</span>
                  <span className="author-label">Asked this question</span>
                </div>
              </div>
            </div>
          )}

          {/* Approved Answers */}
          <div className="answers-section">
            <h2 className="answers-title">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            {answers.length > 0 ? (
              <div className="answers-list">
                {answers.map((answer) => (
                  <div key={answer.id} className="answer-card">
                    <p className="answer-text">{answer.answerText}</p>

                    <div className="answer-footer">
                      <div className="answer-author">
                        <div className="author-avatar small">
                          {answer.answeredBy?.charAt(0).toUpperCase()}
                        </div>
                        <span>{answer.answeredBy}</span>
                      </div>

                      <span className="answer-date">{formatDate(answer.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-answers">
                <p>No answers yet. Be the first to answer!</p>
              </div>
            )}
          </div>

          {/* Submit Answer */}
          <div className="submit-answer-section">
            <h2>Your Answer</h2>

            <form onSubmit={handleSubmitAnswer}>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Write your answer here..."
                  rows="5"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AnswerQuestion;

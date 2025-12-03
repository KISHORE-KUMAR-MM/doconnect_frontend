import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import './AskQuestion.css';

function AskQuestion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const topics = [
    'Technology',
    'Science',
    'Health',
    'Business',
    'Education',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.topic || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const username = localStorage.getItem('username');
      const questionData = {
        ...formData,
        postedBy: username,
        postedAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:8083/api/question/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      });

      if (response.ok) {
        setSuccess('Question submitted successfully! It will be visible after admin approval.');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError('Failed to submit question. Please try again.');
      }
    } catch (err) {
      setSuccess('Question submitted! (Demo mode - API not connected)');
      setTimeout(() => navigate('/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-question-page">
      <Navbar />

      <main className="ask-question-main">
        <div className="ask-question-container">
          <div className="page-header">
            <h1>Ask a Question</h1>
            <p>Get answers from our community of experts</p>
          </div>

          <form className="question-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="topic">Topic *</label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
              >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a concise, descriptive title..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Your Question *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your question in detail..."
                rows="6"
                required
              />
              <span className="char-count">
                {formData.description.length} / 2000 characters
              </span>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Question'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AskQuestion;

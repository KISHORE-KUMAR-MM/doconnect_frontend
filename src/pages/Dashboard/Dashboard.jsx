import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar.jsx';
import QuestionCard from '../../components/QuestionCard/QuestionCard.jsx';
import './Dashboard.css';

function Dashboard() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    'Technology',
    'Science',
    'Health',
    'Business',
    'Education',
    'Other'
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/question/approved');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        // Use dummy data for demonstration
        setQuestions([]);
      }
    } catch (err) {
      // Use dummy data if API is unavailable
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  

  const filterQuestions = () => {
    let filtered = [...questions];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.topic === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.title?.toLowerCase().includes(term) ||
        q.description?.toLowerCase().includes(term)
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 3) {
      try {
        const response = await fetch(`http://localhost:8083/api/question/search/${value}`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        }
      } catch (err) {
        // Filter locally if API fails
      }
    } else if (value.length === 0) {
      fetchQuestions();
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Explore Questions</h1>
            <p>Find answers to your questions or help others with theirs</p>
          </div>

          <div className="filters-section">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="category-filter">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading questions...</p>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="questions-grid">
              {filteredQuestions.map(question => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">?</div>
              <h3>No questions found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import './QuestionCard.css';

function QuestionCard({ question }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="question-card">
      <div className="card-header">
        <span className="card-topic">{question.topic || 'General'}</span>
        <span className="card-date">{formatDate(question.postedAt || new Date())}</span>
      </div>

      <h3 className="card-title">{question.title || question.description}</h3>
      
      <p className="card-preview">
        {question.description?.substring(0, 150)}
        {question.description?.length > 150 ? '...' : ''}
      </p>

      <div className="card-footer">
        <div className="card-author">
          <div className="author-avatar">
            {(question.postedBy || 'U').charAt(0).toUpperCase()}
          </div>
          <span>{question.postedBy || 'Anonymous'}</span>
        </div>

        <Link to={`/question/${question.id}`} className="view-answers-btn">
          View Answers
        </Link>
      </div>
    </div>
  );
}

export default QuestionCard;

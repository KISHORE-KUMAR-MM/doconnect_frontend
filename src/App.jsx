import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import AskQuestion from './pages/AskQuestion/AskQuestion.jsx';
import AnswerQuestion from './pages/AnswerQuestion/AnswerQuestion.jsx';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx';
import AdminLogin from './pages/AdminLogin/AdminLogin.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ask-question" element={<AskQuestion />} />
          <Route path="/question/:id" element={<AnswerQuestion />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

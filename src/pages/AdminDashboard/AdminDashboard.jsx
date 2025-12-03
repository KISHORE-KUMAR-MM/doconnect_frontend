import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const adminUsername = localStorage.getItem("adminUsername") || "Admin";

  const [activeTab, setActiveTab] = useState("questions");
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [pendingAnswers, setPendingAnswers] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchPendingItems();
    fetchAllQuestions();
    fetchAllUsers();
  }, []);

  // ------------------------------
  // FETCH DATA
  // ------------------------------
  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const qRes = await fetch("http://localhost:8083/api/question/pending");
      if (qRes.ok) setPendingQuestions(await qRes.json());

      const aRes = await fetch("http://localhost:8083/api/answers/pending");
      if (aRes.ok) setPendingAnswers(await aRes.json());
    } catch (e) {
      console.log("Error loading pending data", e);
    }
    setLoading(false);
  };

  const fetchAllQuestions = async () => {
    try {
      const res = await fetch("http://localhost:8083/api/question/all");
      if (res.ok) setAllQuestions(await res.json());
    } catch (e) {
      console.log("Error loading all questions", e);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/users/all");
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.log("Error loading users", e);
    }
  };

  // ------------------------------
  // QUESTION ACTIONS
  // ------------------------------
  const handleApproveQuestion = async (id) => {
    await fetch(`http://localhost:8083/api/question/approve/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: adminUsername }),
    });
    fetchPendingItems();
  };

  const handleRejectQuestion = async (id) => {
    await fetch(`http://localhost:8083/api/question/reject/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectedBy: adminUsername }),
    });
    fetchPendingItems();
  };

  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    await fetch(`http://localhost:8083/api/question/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: editText }),
    });

    setEditingId(null);
    fetchAllQuestions();
  };

  const handleDeleteQuestion = async (id) => {
    await fetch(`http://localhost:8083/api/question/delete/${id}`, {
      method: "DELETE",
    });
    fetchAllQuestions();
  };

  // ------------------------------
  // USER ACTIONS
  // ------------------------------
  const toggleUserStatus = async (id, newStatus) => {
    await fetch(`http://localhost:8081/api/users/status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchAllUsers();
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-logo">
            <span className="logo-icon">DC</span>
            <div className="logo-text">
              <span className="brand">DoConnect</span>
              <span className="admin-label">ADMIN PANEL</span>
            </div>
          </div>

          <div className="admin-user">
            <span>
              Welcome, <strong>{adminUsername}</strong>
            </span>
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("adminUsername");
                navigate("/admin/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Stats */}
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-number">{pendingQuestions.length}</div>
              <div className="stat-label">Pending Questions</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{pendingAnswers.length}</div>
              <div className="stat-label">Pending Answers</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={activeTab === "questions" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("questions")}
            >
              Pending Questions
            </button>

            <button
              className={activeTab === "answers" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("answers")}
            >
              Pending Answers
            </button>

            <button
              className={activeTab === "allQuestions" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("allQuestions")}
            >
              All Questions
            </button>

            <button
              className={activeTab === "users" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="admin-content">
              {/* ALL QUESTIONS WITH INLINE EDIT */}
              {activeTab === "allQuestions" && (
                <div className="items-list">
                  <div className="top-actions">
                    <button className="btn-add" onClick={() => navigate("/admin/add-question")}>
                      + Add Question
                    </button>
                  </div>

                  {allQuestions.length ? (
                    allQuestions.map((q) => (
                      <div key={q.id} className="admin-item-card">
                        <div className="item-header">
                          <span className="item-topic">{q.topic}</span>
                          <span className="item-date">{formatDate(q.postedAt)}</span>
                        </div>

                        {/* INLINE EDIT SECTION */}
                        {editingId === q.id ? (
                          <div className="edit-area">
                            <textarea
                              className="edit-textbox"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />

                            <div className="edit-buttons">
                              <button className="btn-approve" onClick={() => saveEdit(q.id)}>
                                Save
                              </button>
                              <button className="btn-delete" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="editable-text">
                            {q.description}
                            <button className="edit-icon" onClick={() => startEdit(q.id, q.description)}>
                              ✏️
                            </button>
                          </p>
                        )}

                        <div className="item-footer">
                          <span>{q.postedBy}</span>

                          <div className="item-actions">
                            <button className="btn-delete" onClick={() => handleDeleteQuestion(q.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No questions available</p>
                  )}
                </div>
              )}

              {/* USERS */}
              {activeTab === "users" && (
                <div className="items-list">
                  {users.length ? (
                    users.map((u) => (
                      <div key={u.id} className="admin-item-card">
                        <div className="item-header">
                          <span>{u.username}</span>
                          <span className="role-badge">{u.role}</span>
                        </div>

                        <p>Email: {u.email}</p>
                        <p>Status: {u.status === "ACTIVE" ? "Active" : "Inactive"}</p>

                        <div className="item-actions">
                          <button
                            className="btn-edit"
                            onClick={() =>
                              toggleUserStatus(u.id, u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")
                            }
                          >
                            {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No users found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

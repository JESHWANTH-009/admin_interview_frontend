import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Interviews.css";
import apiClient from '../apiClient';
const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL", API_URL);
export default function Interviews() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [roleFilter, setRoleFilter] = useState("all");
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem('firebase_id_token');
        const response = await fetch(`${API_URL}/interviews`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        if (!response.ok) throw new Error("Failed to fetch interviews");
        const data = await response.json();
        // Sort interviews by created_at (or createdAt/createdDate) descending
        const sorted = (data.interviews || []).slice().sort((a, b) => {
          // Try all possible field names
          const aTime = new Date(a.created_at || a.createdAt || a.createdDate || 0).getTime();
          const bTime = new Date(b.created_at || b.createdAt || b.createdDate || 0).getTime();
          return bTime - aTime;
        });
        setInterviews(sorted);
      } catch (err) {
        // handle error
      }
    };
    fetchInterviews();
  }, []);

  const roles = ["Frontend Developer", "Backend Developer", "DevOps Engineer", "Full Stack Developer", "UI/UX Designer"];
  // const statuses = ["all", "active", "completed", "draft", "paused"]; // eslint-disable-line no-unused-vars

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || interview.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview?')) return;
    try {
      await apiClient.delete(`/interviews/${id}`);
      setInterviews((prev) => prev.filter((interview) => interview.id !== id));
    } catch (err) {
      alert('Failed to delete interview.');
    }
  };

  return (
    <div className="interviews-page">
      <div className="interviews-header-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search interviews..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="role-filter"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <div className="interviews-grid">
        {filteredInterviews.map((interview) => {
          const completedCount = Array.isArray(interview.candidates)
            ? interview.candidates.filter(c => c.status === "completed").length
            : 0;
          const createdDate = interview.created_at
            ? new Date(interview.created_at).toLocaleDateString()
            : "-";
          const isCompleted = Array.isArray(interview.candidates) && interview.candidates.length > 0 && completedCount === interview.candidates.length;
          return (
            <div key={interview.id} className="interview-card">
              <div className="interview-card-header">
                <h3 className="interview-title">{interview.title}</h3>
                <span className={`status-badge ${isCompleted ? 'completed' : 'active'}`}>{isCompleted ? 'Completed' : 'Active'}</span>
              </div>
              <div className="interview-role">{interview.role}</div>
              <div className="interview-meta">
                <div><strong>{Array.isArray(interview.candidates) ? interview.candidates.length : 0}</strong> candidates</div>
                <div className="meta-divider" />
                <div><strong>{completedCount}</strong> completed</div>
                <div className="meta-divider" />
                <div>Created: {createdDate}</div>
              </div>
              <button className="view-details-btn" onClick={() => navigate(`/interviews/${interview.id}`)}>View Details</button>
              <button className="delete-btn" onClick={() => handleDelete(interview.id)} style={{marginTop: 8, background: '#ff4d4f', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer'}}>Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

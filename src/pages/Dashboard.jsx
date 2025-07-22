import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL", API_URL);
//const API_URL ="https://admin-interview-backend.orangeplant-f4cd2fc4.southindia.azurecontainerapps.io";
export default function Dashboard({ onLogout }) {
  const [totalInterviews, setTotalInterviews] = useState('--');
  // const completionRate = ... // eslint-disable-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState('--');
  const [recentInterviews, setRecentInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviewStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('firebase_id_token');
        
         // Add this just before the fetch
        const res = await fetch(`${API_URL}/interviews`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        const interviews = Array.isArray(data.interviews) ? data.interviews : [];
        setTotalInterviews(interviews.length);
        // Calculate completed sessions: candidates.length > 0 && candidates.length === responses.length
        // const completedSessions = interviews.filter(i => {
        //   const candidates = Array.isArray(i.candidates) ? i.candidates : [];
        //   const responses = Array.isArray(i.responses) ? i.responses : [];
        //   return candidates.length > 0 && candidates.length === responses.length;
        // }).length;
        // Calculate completion rate
        // const rate = interviews.length > 0 ? Math.round((completedSessions / interviews.length) * 100) : 0;
        // setCompletionRate(`${rate}%`); // This line was commented out in the original file
        // Active Sessions logic
        const activeCount = interviews.filter(i => {
          const candidates = Array.isArray(i.candidates) ? i.candidates : [];
          if (candidates.length === 0) return false; 
          
          const completedCandidates = candidates.filter(c => c.status === 'completed').length;
          return candidates.length !== completedCandidates;
        }).length;
        setActiveSessions(activeCount);
        // Sort by created_at descending and take 5 most recent
        const sorted = interviews.slice().sort((a, b) => {
          const aTime = new Date(a.created_at || a.createdAt || a.createdDate || 0).getTime();
          const bTime = new Date(b.created_at || b.createdAt || b.createdDate || 0).getTime();
          return bTime - aTime;
        });
        setRecentInterviews(sorted.slice(0, 5));
      } catch (err) {
        setTotalInterviews('--');
        // setCompletionRate('--%'); // This line was commented out in the original file
        setActiveSessions('--');
        setRecentInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewStats();
  }, []);

  // Mock data for dashboard
  const metrics = [
    { label: "Total Interviews", value: loading ? '--' : totalInterviews },
    { label: "Active Sessions", value: loading ? '--' : activeSessions },
    { label: "Completed Sessions", value: loading || totalInterviews === '--' || activeSessions === '--' ? '--' : (totalInterviews - activeSessions) },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div>
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your interviews.</p>
        </div>
        <button
          className="dashboard-logout-btn enhanced"
          onClick={onLogout}
          style={{ position: 'absolute', right: 0, top: 0, margin: '1.5rem 2rem 0 0', padding: '0.6rem 2rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '999px', background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.10)', letterSpacing: '0.03em', transition: 'background 0.2s, box-shadow 0.2s', zIndex: 2 }}
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)'}
        >
          <span style={{ marginRight: 8, fontWeight: 700 }}>⎋</span> Logout
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <span className="metric-label">{metric.label}</span>
            </div>
            <div className="metric-value">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Interviews - now full width */}
      <div className="recent-interviews-section">
        <div className="section-header">
          <h2>Recent Interviews</h2>
          <button className="primary" onClick={() => navigate('/interviews')}>View All</button>
        </div>
        <div className="interviews-list">
          {recentInterviews.map((interview) => {
            const completedCount = Array.isArray(interview.candidates)
              ? interview.candidates.filter(c => c.status === "completed").length
              : 0;
            const createdDate = interview.created_at
              ? new Date(interview.created_at).toLocaleDateString()
              : "-";
            return (
              <div key={interview.id} className="interview-card">
                <div className="interview-info">
                  <h3>{interview.title}</h3>
                  <p className="interview-role">{interview.role}</p>
                  <div className="interview-stats">
                    <span>{Array.isArray(interview.candidates) ? interview.candidates.length : 0} candidates</span>
                    <span>{completedCount} completed</span>
                  </div>
                </div>
                <div className="interview-status">
                  <span className="interview-date">{createdDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}  
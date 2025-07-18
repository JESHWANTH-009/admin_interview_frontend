import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../apiClient";
import "./InterviewDetails.css";

export default function InterviewDetail() {
  const { id } = useParams(); // interview ID from URL
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const token = localStorage.getItem("firebase_id_token");
        const res = await apiClient.get(`/interviews/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInterview(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load interview details.");
      }
    };

    fetchInterview();
  }, [id]);

  const handleAddEmail = async () => {
    setInviteError("");
    if (!newEmail.match(/^\S+@\S+\.\S+$/)) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    setInviteLoading(true);
    try {
      const token = localStorage.getItem("firebase_id_token");
      const res = await apiClient.post(
        "/invite/send",
        { interview_id: id, emails: [newEmail] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add new candidate to the list if successful
      if (res.data.success && res.data.success.length > 0) {
        setInterview((prev) => ({
          ...prev,
          candidates: [
            ...(prev.candidates || []),
            { email: newEmail, link: res.data.success[0].link, status: "pending" },
          ],
        }));
        setNewEmail("");
      } else {
        setInviteError("Failed to add candidate. Try again.");
      }
    } catch (err) {
      setInviteError(err.response?.data?.detail || "Failed to add candidate.");
    } finally {
      setInviteLoading(false);
    }
  };

  if (error) {
    return <div className="details-container"><div className="error-message">{error}</div></div>;
  }

  if (!interview) {
    return <div className="details-container"><div className="loading-message">Loading interview details...</div></div>;
  }

  return (
    <div className="details-container">
      <div className="details-card">
        <h1 className="details-title">{interview.title}</h1>
        <div className="details-meta-row">
          <span className="details-role"><strong>Role:</strong> {interview.role}</span>
        </div>
        <hr className="details-divider" />
        <h2 className="details-subtitle">Invited Candidates</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
          <input
            type="email"
            placeholder="Enter candidate email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 16, minWidth: 220 }}
            disabled={inviteLoading}
          />
          <button
            onClick={handleAddEmail}
            disabled={inviteLoading || !newEmail}
            style={{ padding: '8px 18px', borderRadius: 6, background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', fontWeight: 600, border: 'none', cursor: inviteLoading ? 'not-allowed' : 'pointer', fontSize: 16 }}
          >
            {inviteLoading ? 'Adding...' : 'Add Email'}
          </button>
          {inviteError && <span style={{ color: '#dc2626', fontSize: 15 }}>{inviteError}</span>}
        </div>
        {interview.candidates && interview.candidates.length > 0 ? (
          <table className="details-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Link</th>
                <th>Status</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {interview.candidates.map((candidate, idx) => (
                <tr key={idx}>
                  <td>{candidate.email}</td>
                  <td>
                    <a
                      href={candidate.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {candidate.link}
                    </a>
                  </td>
                  <td>
                    <span className={`status-badge status-${candidate.status}`}>{candidate.status}</span>
                  </td>
                  <td>
                    {candidate.status === 'completed' && candidate.total_score !== undefined ? candidate.total_score : '-'}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(candidate.link);
                        alert("Link copied to clipboard!");
                      }}
                      className="copy-link-btn"
                    >
                      Copy Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-candidates">No candidates invited yet.</p>
        )}
      </div>
    </div>
  );
}

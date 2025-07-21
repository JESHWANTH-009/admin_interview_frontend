import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './InterviewDetails.css';
const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL", API_URL);
const InterviewDetails = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const token = localStorage.getItem('firebase_id_token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/interviews/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch interview');
        const data = await res.json();
        setInterview(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchInterview();
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!interview) return <p>Loading...</p>;

  return (
    <div style={{ padding: '30px' }}>
      <h2>{interview.title}</h2>
      <p><strong>Role:</strong> {interview.role}</p>
      <h3 style={{ marginTop: '20px' }}>Candidate List:</h3>
      {interview.candidates?.length > 0 ? (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Link</th>
              <th>Status</th>
              <th>Scores</th>
              <th>Sent At</th>
            </tr>
          </thead>
          <tbody>
            {interview.candidates.map((c, idx) => (
              <tr key={idx}>
                <td>{c.email}</td>
                <td>
                  <a href={c.link} target="_blank" rel="noopener noreferrer">{c.link}</a>
                </td>
                <td>{c.status}</td>
                <td>{c.status === "completed" && c.total_score !== undefined ? c.total_score : "-"}</td>
                <td>{new Date(c.sent_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No candidates invited yet.</p>
      )}
    </div>
  );
};

export default InterviewDetails;


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../apiClient';
import './InterviewPage.css';
const API_URL = process.env.REACT_APP_API_URL;
//const API_BASE_URL = 'http://localhost:8000'; 
console.log("API_URL", API_URL);
const InterviewPage = () => {
  const { token } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await apiClient.get(`${API_URL}/interview/${token}`);
        setInterviewData(res.data);
      } catch (err) {
        console.error('Error fetching interview:', err);
      }
    };

    fetchInterview();
  }, [token]);

  const handleChange = (q, e) => {
    setAnswers({ ...answers, [q]: e.target.value });
  };

  const handleSubmit = async () => {
    const formattedResponses = Object.entries(answers).map(([question, answer]) => ({ question, answer }));
    try {
      const res = await apiClient.post(`${API_URL}/interview/${token}/submit`, {
        token,
        responses: formattedResponses,
      });
      setSubmitted(true);
      alert("Interview submitted successfully! 🎉");
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  if (!interviewData) return <p>Loading...</p>;
  if (submitted) return <p>✅ Interview submitted. Thank you!</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{interviewData.title}</h2>
      <p><strong>Role:</strong> {interviewData.role}</p>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {interviewData.questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: '15px' }}>
            <label><strong>Q{idx + 1}: {q}</strong></label><br />
            <textarea
              rows={4}
              value={answers[q] || ''}
              onChange={(e) => handleChange(q, e)}
              required
              style={{ width: '100%' }}
            />
          </div>
        ))}
        <button type="submit">Submit Interview</button>
      </form>
    </div>
  );
};

export default InterviewPage;

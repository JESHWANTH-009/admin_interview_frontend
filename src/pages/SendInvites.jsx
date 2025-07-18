import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../apiClient';

export default function SendInvites() {
  const { interviewId } = useParams();
  const [emails, setEmails] = useState(['']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (idx, value) => {
    setEmails(emails.map((e, i) => (i === idx ? value : e)));
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (idx) => {
    setEmails(emails.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('firebase_id_token');
      const res = await apiClient.post('/invite/send', {
        interview_id: interviewId,
        emails: emails.filter(email => email.trim() !== ''),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setResult({
        success: res.data.success,
        failed: res.data.failed || []
      });
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send invites.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch {
      alert('Failed to copy link.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ width: '100%', maxWidth: 600, minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36 }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 18, textAlign: 'center', color: '#1e293b' }}>Send Invites</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: '#334155' }}>Candidate Emails</label>
          {emails.map((email, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <input
                type="email"
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 16, marginRight: 8, background: '#f9fafb' }}
                value={email}
                onChange={e => handleEmailChange(idx, e.target.value)}
                placeholder="Enter Gmail address"
                required
              />
              {emails.length > 1 && (
                <button type="button" style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: 22, marginRight: 4, cursor: 'pointer', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleRemoveEmail(idx)} title="Remove email">-</button>
              )}
              {idx === emails.length - 1 && (
                <button type="button" style={{ color: '#22c55e', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleAddEmail} title="Add email">+</button>
              )}
            </div>
          ))}
          <button type="submit" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '12px 0', width: '100%', marginTop: 18, boxShadow: '0 2px 8px rgba(37,99,235,0.08)', cursor: 'pointer', transition: 'background 0.2s' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Invites'}
          </button>
          {error && <div style={{ color: '#dc2626', marginTop: 12, fontWeight: 600, background: '#fee2e2', borderRadius: 8, padding: 10, textAlign: 'center' }}>{error}</div>}
        </form>
        {result && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10, color: '#16a34a' }}>Success</h3>
            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#f8fafc', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(59,130,246,0.04)' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b', fontWeight: 700 }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b', fontWeight: 700 }}>Link</th>
                    <th style={{ padding: '12px 16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {result.success.map(({ email, link }, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '12px 16px', fontSize: 15, color: '#1e293b', fontWeight: 500 }}>{email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 15 }}>
                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}>{link}</a>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 1px 4px rgba(37,99,235,0.08)' }}
                          onClick={() => handleCopy(link)}
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.failed.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10, color: '#dc2626' }}>Failed</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#f8fafc', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(239,68,68,0.04)' }}>
                    <thead style={{ background: '#fef2f2' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#dc2626', fontWeight: 700 }}>Email</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#dc2626', fontWeight: 700 }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.failed.map(({ email, reason }, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #fecaca', background: idx % 2 === 0 ? '#fff' : '#fef2f2' }}>
                          <td style={{ padding: '12px 16px', fontSize: 15, color: '#b91c1c', fontWeight: 500 }}>{email}</td>
                          <td style={{ padding: '12px 16px', fontSize: 15, color: '#dc2626' }}>{reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

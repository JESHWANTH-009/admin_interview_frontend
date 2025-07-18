import React, { useState } from 'react';
import apiClient from '../apiClient';
import './CreateTemplateModal.css'; // Reuse modal styles

export default function UploadPDFModal({ open, onClose, onExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('firebase_id_token');
      const res = await apiClient.post('/upload/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      if (onExtracted) onExtracted(res.data.questions || []);
      setFile(null);
      onClose();
    } catch (err) {
      let msg = 'Failed to upload PDF.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          msg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map(e => e.msg).join('; ');
        } else if (typeof err.response.data.detail === 'object') {
          msg = JSON.stringify(err.response.data.detail);
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="template-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 className="modal-title">Upload PDF</h2>
        <div className="modal-group">
          <label className="modal-label">Select PDF File *</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          {file && <div className="imported-file">{file.name}</div>}
        </div>
        {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="modal-actions">
          <button type="button" className="outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={handleExtract} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Extract'}
          </button>
        </div>
      </div>
    </div>
  );
} 
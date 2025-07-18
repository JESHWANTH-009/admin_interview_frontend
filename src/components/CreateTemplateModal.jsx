import React, { useState } from "react";
import "./CreateTemplateModal.css";

export default function CreateTemplateModal({ open, onClose, onSave }) {
  const [template, setTemplate] = useState({
    name: "",
    description: "",
    questions: [
      { text: "", type: "Short Answer", timeLimit: 5, suggestedAnswer: "" },
    ],
  });
  const [importedFile, setImportedFile] = useState(null);

  const QUESTION_TYPES = ["Short Answer", "Multiple Choice", "Coding", "Essay"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplate((t) => ({ ...t, [name]: value }));
  };

  const handleQuestionChange = (idx, field, value) => {
    setTemplate((t) => {
      const questions = [...t.questions];
      questions[idx][field] = value;
      return { ...t, questions };
    });
  };

  const handleAddQuestion = () => {
    setTemplate((t) => ({
      ...t,
      questions: [
        ...t.questions,
        { text: "", type: "Short Answer", timeLimit: 5, suggestedAnswer: "" },
      ],
    }));
  };

  const handleRemoveQuestion = (idx) => {
    setTemplate((t) => ({
      ...t,
      questions: t.questions.filter((_, i) => i !== idx),
    }));
  };

  const handleFileChange = (e) => {
    setImportedFile(e.target.files[0]);
    // TODO: handle file import logic
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Save template logic
    if (onSave) onSave(template);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <form className="template-modal" onSubmit={handleSubmit}>
        <h2 className="modal-title">Create Question Template</h2>
        <div className="modal-group">
          <label className="modal-label">Template Name *</label>
          <input
            name="name"
            value={template.name}
            onChange={handleChange}
            className="modal-input"
            required
          />
        </div>
        <div className="modal-group">
          <label className="modal-label">Description</label>
          <textarea
            name="description"
            value={template.description}
            onChange={handleChange}
            className="modal-input"
            rows={2}
          />
        </div>
        <div className="modal-group">
          <label className="modal-label">Import from File</label>
          <input type="file" onChange={handleFileChange} />
          {importedFile && <div className="imported-file">{importedFile.name}</div>}
        </div>
        <div className="modal-group">
          <label className="modal-label">Questions</label>
          <div className="questions-list">
            {template.questions.map((q, idx) => (
              <div key={idx} className="question-block">
                <div className="question-row">
                  <input
                    className="modal-input"
                    placeholder={`Question ${idx + 1} text`}
                    value={q.text}
                    onChange={(e) => handleQuestionChange(idx, "text", e.target.value)}
                    required
                  />
                  <select
                    className="modal-input"
                    value={q.type}
                    onChange={(e) => handleQuestionChange(idx, "type", e.target.value)}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input
                    className="modal-input"
                    type="number"
                    min={1}
                    max={120}
                    value={q.timeLimit}
                    onChange={(e) => handleQuestionChange(idx, "timeLimit", e.target.value)}
                    placeholder="Time (min)"
                    style={{ width: 80 }}
                  />
                  <button
                    type="button"
                    className="remove-question-btn"
                    onClick={() => handleRemoveQuestion(idx)}
                    disabled={template.questions.length === 1}
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  className="modal-input"
                  placeholder="Suggested Answer (Optional)"
                  value={q.suggestedAnswer}
                  onChange={(e) => handleQuestionChange(idx, "suggestedAnswer", e.target.value)}
                  rows={2}
                />
              </div>
            ))}
            <button type="button" className="add-question-btn" onClick={handleAddQuestion}>
              + Add Question
            </button>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
} 
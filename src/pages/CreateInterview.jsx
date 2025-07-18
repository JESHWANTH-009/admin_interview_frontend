import React, { useState } from "react";
import CreateTemplateModal from "../components/CreateTemplateModal";
import UploadPDFModal from "../components/UploadPDFModal";
import { useNavigate } from "react-router-dom";
import apiClient from "../apiClient";
import "./CreateInterview.css";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Full Stack Developer",
  "UI/UX Designer",
];

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"];

export default function CreateInterview() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "",
    experience: "",
    numQuestions: 5,
    questionSource: "ai",
    focusAreas: [],
    selectedTemplate: "",
  });

  // const showTemplateSection = ... // eslint-disable-line no-unused-vars
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [editableQuestions, setEditableQuestions] = useState([]);
  const [questionType, setQuestionType] = useState("Text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Remove aiQuestionType state
  // const [aiQuestionType, setAiQuestionType] = useState("Text");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "numQuestions" ? Number(value) : value,
    }));
  };

  // const handleFocusToggle = ... // eslint-disable-line no-unused-vars
  const handleQuestionSource = (e) => {
    setForm((prev) => ({
      ...prev,
      questionSource: e.target.value,
      selectedTemplate: "",
    }));
    // setShowTemplateSection(e.target.value === "template"); // This line was removed
  };

  const handleExtracted = (questions) => {
    setExtractedQuestions(questions);
    setEditableQuestions(questions);
    setQuestionType('Text'); // Default to 'Text' for PDF uploads
  };

  const handleQuestionEdit = (index, value) => {
    setEditableQuestions((prev) =>
      prev.map((q, i) => (i === index ? value : q))
    );
  };

  const handleTemplateSave = (template) => {
    setTemplates((prev) => [...prev, template]);
    setTemplateModalOpen(false);
    setForm((prev) => ({ ...prev, selectedTemplate: template.name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let questions = editableQuestions;
      let type = questionType;
      if (form.questionSource === "ai") {
        // Generate questions via backend
        const res = await apiClient.post("/generate/ai", {
          role: form.role,
          experience: form.experience,
          count: form.numQuestions,
          question_type: "Text" // Always use 'Text'
        });
        questions = res.data.questions;
        type = "AI";
      }
      // const token = localStorage.getItem("firebase_id_token"); // This line was removed
      const response = await apiClient.post(
        "/interviews/create",
        {
          title: form.title,
          role: form.role,
          question_type: form.questionSource === "ai" ? "Text" : type,
          questions: questions,
          created_at: new Date().toISOString()
        }
      );
      const interview_id = response.data.interview_id;
      navigate(`/send-invites/${interview_id}`);
    } catch (error) {
      let msg = "Failed to create interview.";
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          msg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          msg = error.response.data.detail.map(e => e.msg).join("; ");
        } else if (typeof error.response.data.detail === "object") {
          msg = JSON.stringify(error.response.data.detail);
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-interview-page">
      <form className="create-interview-form" onSubmit={handleSubmit}>
        <h1 className="form-title">Create New Interview Session</h1>

        <div className="form-group">
          <label className="form-label">Interview Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Frontend Developer Assessment"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Question Source *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="questionSource"
                value="ai"
                checked={form.questionSource === "ai"}
                onChange={handleQuestionSource}
              />
              AI Generated
            </label>
            <label>
              <input
                type="radio"
                name="questionSource"
                value="template"
                checked={form.questionSource === "template"}
                onChange={handleQuestionSource}
              />
              Custom Template
            </label>
          </div>
        </div>

        {/* Remove Question Type select for AI Generated */}

        {form.questionSource === "ai" && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select a role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience Level *</label>
              <select
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Number of Questions *</label>
              <input
                name="numQuestions"
                type="number"
                min={1}
                max={50}
                value={form.numQuestions}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        )}

        {form.questionSource === "template" && (
          <div className="form-group">
            <button
              type="button"
              className="primary"
              style={{ marginBottom: 16 }}
              onClick={() => setShowUploadModal(true)}
            >
              Upload PDF
            </button>
            <UploadPDFModal
              open={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onExtracted={handleExtracted}
            />
          </div>
        )}

        {form.questionSource === "template" &&
          extractedQuestions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  Extracted Questions (Editable)
                </h3>
                <ol>
                  {editableQuestions.map((q, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <input
                        className="form-input"
                        value={q}
                        onChange={(e) =>
                          handleQuestionEdit(i, e.target.value)
                        }
                        style={{ width: "90%" }}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

        <div className="form-actions">
          <button
            type="button"
            className="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="primary">
            {loading ? "Loading..." : "Next"}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Generating questions, please wait...</div>}
      </form>

      <CreateTemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSave={handleTemplateSave}
      />
    </div>
  );
}

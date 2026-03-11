"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useCookieOverride } from "@/hooks/use-cookie-override";
import { useStateApi } from "@/hooks/use-state-api";

const defaultPayload = `{
  "meta": {
    "created_at": "2024-04-01T12:00:00+00:00",
    "updated_at": "2024-04-01T12:30:00+00:00",
    "version": 1,
    "type": "govform"
  },
  "data": {
    "delay_seconds": 0,
    "form": {
      "page1": { "first_name": "", "last_name": "", "date_of_birth": "", "gender": "", "nationality": "" },
      "page2": { "passport_number": "", "visa_type": "", "travel_purpose": "", "arrival_date": "", "departure_date": "" },
      "page3": { "email": "", "phone": "", "address": "", "city": "", "postal_code": "", "country": "" }
    },
    "completed_pages": [],
    "uploads": []
  },
  "note": null
}`;

const dataFields = [
  { title: "data.delay_seconds", description: "Number. Artificial backend delay in seconds applied to API responses." },
  { title: "data.form.page1", description: "Object. Basic personal information (first_name, last_name, date_of_birth, gender, nationality)." },
  { title: "data.form.page2", description: "Object. Travel document info (passport_number, visa_type, travel_purpose, arrival_date, departure_date). Locked until page1 and page3 are completed." },
  { title: "data.form.page3", description: "Object. Contact information (email, phone, address, city, postal_code, country)." },
  { title: "data.completed_pages", description: "Array<string>. List of completed page identifiers (page1, page2, page3)." },
  { title: "data.uploads", description: "Array<Upload>. Stored file metadata scoped to the current user." },
];

export default function StateManage() {
  const { ready } = useCookieOverride();
  const {
    state,
    loading,
    error,
    userId,
    refreshState,
    replaceState,
    resetState,
    clearError,
  } = useStateApi();

  const [activeTab, setActiveTab] = useState("manage");
  const [editor, setEditor] = useState(defaultPayload);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const initializedRef = useRef(false);

  const lastUpdated = state?.state?.meta?.updated_at || "not synced yet";

  useEffect(() => {
    if (ready && !initializedRef.current) {
      initializedRef.current = true;
      refreshState();
    }
  }, [ready, refreshState]);

  useEffect(() => {
    if (state) {
      setEditor(JSON.stringify(state.state, null, 2));
    }
  }, [state]);

  useEffect(() => {
    if (error) {
      setLocalError(error.message);
    }
  }, [error]);

  const parseEditor = () => {
    try {
      return JSON.parse(editor);
    } catch {
      throw new Error("Editor content is not valid JSON.");
    }
  };

  const handleSave = async () => {
    setMessage("");
    setLocalError("");
    clearError();
    try {
      const payload = parseEditor();
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("State must be a JSON object.");
      }
      const hasEnvelope = Object.prototype.hasOwnProperty.call(payload, "data");
      const nextData = hasEnvelope ? payload.data : payload;
      if (!nextData || typeof nextData !== "object" || Array.isArray(nextData)) {
        throw new Error("State must include a data object.");
      }
      const hasNote = Object.prototype.hasOwnProperty.call(payload, "note");
      const nextNote = hasNote ? payload.note : undefined;
      const hasMeta = Object.prototype.hasOwnProperty.call(payload, "meta");
      const nextMeta = hasMeta ? payload.meta : undefined;
      const result = await replaceState(nextData, nextNote, nextMeta);
      if (result) {
        setEditor(JSON.stringify(result.state, null, 2));
        setMessage("State saved.");
      }
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleReset = async () => {
    setMessage("");
    setLocalError("");
    clearError();
    const result = await resetState();
    if (result) {
      setEditor(JSON.stringify(result.state, null, 2));
      setMessage("State reset.");
    }
  };

  const downloadState = () => {
    setMessage("");
    setLocalError("");
    try {
      const payload = parseEditor();
      const fileNameBase = state?.user_id ? `state-${state.user_id}` : "state";
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileNameBase}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  if (!ready) return null;

  return (
    <div className="gov-container">
      <div className="gov-section">
        <h2>State Console</h2>
        <div style={{ fontSize: "11px", color: "#666", marginBottom: "12px" }}>
          User cookie: {userId} | API base: /api | Last update: {lastUpdated}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            type="button"
            className={`gov-btn ${activeTab === "docs" ? "gov-btn-primary" : ""}`}
            onClick={() => setActiveTab("docs")}
          >
            State Docs
          </button>
          <button
            type="button"
            className={`gov-btn ${activeTab === "manage" ? "gov-btn-primary" : ""}`}
            onClick={() => setActiveTab("manage")}
          >
            Manage State
          </button>
          <Link href="/">
            <button type="button" className="gov-btn">Back to Home</button>
          </Link>
        </div>
      </div>

      {activeTab === "docs" ? (
        <div className="gov-section">
          <h2>Data Field Reference</h2>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {dataFields.map((field) => (
                <tr key={field.title}>
                  <td style={{ fontFamily: "monospace", fontSize: "11px" }}>{field.title}</td>
                  <td>{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: "16px" }}>Example State</h3>
          <pre style={{
            background: "#f8f8f0",
            border: "1px solid #999",
            padding: "8px",
            fontSize: "11px",
            fontFamily: "monospace",
            overflow: "auto",
            maxHeight: "300px",
          }}>
            {defaultPayload}
          </pre>
        </div>
      ) : (
        <div className="gov-section">
          <h2>Edit State (JSON)</h2>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <button
              type="button"
              className="gov-btn"
              onClick={() => refreshState()}
              disabled={loading}
            >
              Refresh from Server
            </button>
          </div>
          <textarea
            value={editor}
            onChange={(e) => setEditor(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              height: "400px",
              fontFamily: "monospace",
              fontSize: "12px",
              border: "1px solid #999",
              padding: "8px",
              backgroundColor: "#fffff8",
            }}
          />
          <div style={{ minHeight: "20px", fontSize: "12px", margin: "4px 0" }}>
            {localError && <span style={{ color: "#c00" }}>{localError}</span>}
            {!localError && message && <span style={{ color: "#080" }}>{message}</span>}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="gov-btn gov-btn-primary" onClick={handleSave} disabled={loading}>
              Save
            </button>
            <button type="button" className="gov-btn" onClick={downloadState} disabled={loading}>
              Download JSON
            </button>
            <button type="button" className="gov-btn" onClick={handleReset} disabled={loading}>
              Reset State
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

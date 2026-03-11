"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCookieOverride } from "@/hooks/use-cookie-override";
import { useStateApi } from "@/hooks/use-state-api";
import FormNavigation from "@/components/FormNavigation";
import type { GovFormStateData, Page1Data } from "@/lib/types";

export default function FormPage1() {
  const { ready } = useCookieOverride();
  const { state, refreshState, patchState } = useStateApi();
  const initRef = useRef(false);

  const [formData, setFormData] = useState<Page1Data>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
  });

  useEffect(() => {
    if (ready && !initRef.current) {
      initRef.current = true;
      refreshState();
    }
  }, [ready, refreshState]);

  useEffect(() => {
    if (state) {
      const data = state.state.data as GovFormStateData;
      if (data.form?.page1) {
        setFormData(data.form.page1);
      }
    }
  }, [state]);

  const handleChange = useCallback((field: keyof Page1Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveComplete = useCallback(() => {
    const data = state?.state.data as GovFormStateData | undefined;
    const completed = data?.completed_pages || [];
    if (!completed.includes("page1")) {
      // Mark page1 as completed when navigating away
      patchState({
        completed_pages: [...completed, "page1"],
      });
    }
  }, [state, patchState]);

  if (!ready) return null;

  const stateData = state?.state.data as GovFormStateData | undefined;
  const completedPages = stateData?.completed_pages || [];

  return (
    <div className="gov-container">
      <FormNavigation
        currentPage="page1"
        completedPages={completedPages}
        formData={formData}
        onSaveComplete={handleSaveComplete}
      />

      <div className="gov-section">
        <h2>Section 1: Basic Personal Information</h2>

        <div className="gov-notice">
          <strong>Instructions:</strong> Please provide your legal name exactly as it appears
          on your government-issued identification. All fields marked with (<span style={{ color: "red" }}>*</span>)
          are required.
        </div>

        <div className="gov-field">
          <label>
            First Name (Given Name) <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            placeholder="Enter first name"
          />
        </div>

        <div className="gov-field">
          <label>
            Last Name (Family Name) <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            placeholder="Enter last name"
          />
        </div>

        <div className="gov-field">
          <label>
            Date of Birth <span className="required">*</span>
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleChange("date_of_birth", e.target.value)}
          />
        </div>

        <div className="gov-field">
          <label>
            Gender <span className="required">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div className="gov-field">
          <label>
            Nationality <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => handleChange("nationality", e.target.value)}
            placeholder="Enter nationality"
          />
        </div>
      </div>

      <div className="gov-notice" style={{ fontSize: "11px" }}>
        <strong>Privacy Notice:</strong> Information collected on this form is used solely for
        official government registration purposes. Your data is protected under the Privacy
        and Data Protection Act (PDPA).
      </div>
    </div>
  );
}

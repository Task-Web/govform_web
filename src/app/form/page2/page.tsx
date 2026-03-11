"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCookieOverride } from "@/hooks/use-cookie-override";
import { useStateApi } from "@/hooks/use-state-api";
import FormNavigation from "@/components/FormNavigation";
import type { GovFormStateData, Page2Data } from "@/lib/types";

export default function FormPage2() {
  const { ready } = useCookieOverride();
  const { state, refreshState, patchState } = useStateApi();
  const router = useRouter();
  const initRef = useRef(false);

  const [formData, setFormData] = useState<Page2Data>({
    passport_number: "",
    visa_type: "",
    travel_purpose: "",
    arrival_date: "",
    departure_date: "",
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

      // Redirect if page is locked (page1 and page3 not completed)
      const completed = data.completed_pages || [];
      if (!completed.includes("page1") || !completed.includes("page3")) {
        router.push("/form/page1");
        return;
      }

      if (data.form?.page2) {
        setFormData(data.form.page2);
      }
    }
  }, [state, router]);

  const handleChange = useCallback((field: keyof Page2Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveComplete = useCallback(() => {
    const data = state?.state.data as GovFormStateData | undefined;
    const completed = data?.completed_pages || [];
    if (!completed.includes("page2")) {
      patchState({
        completed_pages: [...completed, "page2"],
      });
    }
  }, [state, patchState]);

  if (!ready) return null;

  const stateData = state?.state.data as GovFormStateData | undefined;
  const completedPages = stateData?.completed_pages || [];

  // Don't render form if locked
  if (!completedPages.includes("page1") || !completedPages.includes("page3")) {
    return (
      <div className="gov-container">
        <div className="gov-warning">
          <strong>Access Denied:</strong> You must complete Section 1 and Section 3 before
          accessing Section 2. You are being redirected...
        </div>
      </div>
    );
  }

  return (
    <div className="gov-container">
      <FormNavigation
        currentPage="page2"
        completedPages={completedPages}
        formData={formData}
        onSaveComplete={handleSaveComplete}
      />

      <div className="gov-section">
        <h2>Section 2: Travel Document Information</h2>

        <div className="gov-notice">
          <strong>Instructions:</strong> Provide your travel document details as they appear
          on your passport or travel document. This information is required for identity
          verification purposes.
        </div>

        <div className="gov-field">
          <label>
            Passport Number <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.passport_number}
            onChange={(e) => handleChange("passport_number", e.target.value)}
            placeholder="e.g., AB1234567"
            style={{ maxWidth: "200px" }}
          />
        </div>

        <div className="gov-field">
          <label>
            Visa Type <span className="required">*</span>
          </label>
          <select
            value={formData.visa_type}
            onChange={(e) => handleChange("visa_type", e.target.value)}
          >
            <option value="">-- Select Visa Type --</option>
            <option value="tourist">Tourist Visa (B-2)</option>
            <option value="business">Business Visa (B-1)</option>
            <option value="student">Student Visa (F-1)</option>
            <option value="work">Work Visa (H-1B)</option>
            <option value="transit">Transit Visa (C)</option>
            <option value="diplomatic">Diplomatic Visa (A)</option>
            <option value="immigrant">Immigrant Visa</option>
          </select>
        </div>

        <div className="gov-field">
          <label>
            Purpose of Travel <span className="required">*</span>
          </label>
          <select
            value={formData.travel_purpose}
            onChange={(e) => handleChange("travel_purpose", e.target.value)}
          >
            <option value="">-- Select Purpose --</option>
            <option value="tourism">Tourism / Vacation</option>
            <option value="business">Business Meeting / Conference</option>
            <option value="education">Education / Study</option>
            <option value="employment">Employment</option>
            <option value="medical">Medical Treatment</option>
            <option value="family">Family Visit</option>
            <option value="transit">Transit / Layover</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="gov-field">
          <label>
            Expected Date of Arrival <span className="required">*</span>
          </label>
          <input
            type="date"
            value={formData.arrival_date}
            onChange={(e) => handleChange("arrival_date", e.target.value)}
          />
        </div>

        <div className="gov-field">
          <label>
            Expected Date of Departure <span className="required">*</span>
          </label>
          <input
            type="date"
            value={formData.departure_date}
            onChange={(e) => handleChange("departure_date", e.target.value)}
          />
        </div>
      </div>

      <div className="gov-notice" style={{ fontSize: "11px" }}>
        <strong>Declaration:</strong> By submitting this form, I hereby declare that the
        information provided is true, correct, and complete to the best of my knowledge.
        Providing false information is a punishable offense under Section 18 of the
        Immigration and Registration Act.
      </div>
    </div>
  );
}

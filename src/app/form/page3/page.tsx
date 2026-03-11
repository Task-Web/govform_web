"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCookieOverride } from "@/hooks/use-cookie-override";
import { useStateApi } from "@/hooks/use-state-api";
import FormNavigation from "@/components/FormNavigation";
import type { GovFormStateData, Page3Data } from "@/lib/types";

export default function FormPage3() {
  const { ready } = useCookieOverride();
  const { state, refreshState } = useStateApi();
  const initRef = useRef(false);

  const [formData, setFormData] = useState<Page3Data>({
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
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
      if (data.form?.page3) {
        setFormData(data.form.page3);
      }
    }
  }, [state]);

  const handleChange = useCallback((field: keyof Page3Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (!ready) return null;

  const stateData = state?.state.data as GovFormStateData | undefined;
  const completedPages = stateData?.completed_pages || [];

  return (
    <div className="gov-container">
      <FormNavigation
        currentPage="page3"
        completedPages={completedPages}
        formData={formData}

      />

      <div className="gov-section">
        <h2>Section 3: Contact Information</h2>

        <div className="gov-notice">
          <strong>Instructions:</strong> Provide your current contact details. The email
          and phone number will be used for official correspondence regarding your
          registration.
        </div>

        <div className="gov-field">
          <label>
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        <div className="gov-field">
          <label>
            Telephone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="gov-field">
          <label>
            Street Address <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            style={{ maxWidth: "400px" }}
          />
        </div>

        <div className="gov-field">
          <label>
            City <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Enter city"
          />
        </div>

        <div className="gov-field">
          <label>
            Postal / ZIP Code <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => handleChange("postal_code", e.target.value)}
            placeholder="Enter postal code"
            style={{ maxWidth: "150px" }}
          />
        </div>

        <div className="gov-field">
          <label>
            Country <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            placeholder="Enter country"
          />
        </div>
      </div>

      <div className="gov-notice">
        <strong>Note:</strong> Completing all required fields in this section will unlock
        the fields in Section 2 (Travel Document Information). If you have not yet filled
        Section 2, please navigate back after submitting.
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCookieOverride } from "@/hooks/use-cookie-override";
import { useStateApi } from "@/hooks/use-state-api";

export default function Home() {
  const { ready } = useCookieOverride();
  const { refreshState, state } = useStateApi();
  const initRef = useRef(false);

  useEffect(() => {
    if (ready && !initRef.current) {
      initRef.current = true;
      refreshState();
    }
  }, [ready, refreshState]);

  if (!ready) return null;

  const completedPages = (state?.state?.data as Record<string, unknown>)?.completed_pages as string[] || [];

  return (
    <div className="gov-container">
      <div className="gov-section">
        <h2>Welcome to the Personal Information Registration Portal</h2>
        <p style={{ fontSize: "13px", lineHeight: "1.6" }}>
          This portal allows citizens to submit their personal information for official
          registration with the Department of Citizen Services. Please read the instructions
          below carefully before beginning the form.
        </p>
      </div>

      <div className="gov-section">
        <h2>Instructions for Completing This Form</h2>

        <div className="gov-notice">
          <strong>IMPORTANT:</strong> This form consists of three (3) sections that must be
          completed in a specific order. Please follow the steps below precisely.
        </div>

        <div className="gov-tut-step">
          <strong>Step 1 &mdash; Basic Personal Information (Section 1)</strong><br />
          Begin by navigating to Section 1. Fill in your full legal name, date of birth,
          gender, and nationality. All fields marked with an asterisk (<span style={{ color: "red" }}>*</span>)
          are mandatory. Click &quot;Next&quot; to proceed when finished.
        </div>

        <div className="gov-tut-step">
          <strong>Step 2 &mdash; Contact Information (Section 3)</strong><br />
          After completing Section 1, you will be directed to Section 3 (not Section 2).
          Here you must provide your email address, telephone number, and mailing address.
          Complete all required fields and click &quot;Next&quot; to continue.
        </div>

        <div className="gov-tut-step">
          <strong>Step 3 &mdash; Travel Document Information (Section 2)</strong><br />
          Section 2 is only accessible after both Section 1 and Section 3 have been completed.
          In this section, provide your passport number, visa type, purpose of travel,
          and intended travel dates. Submit the form once all fields are complete.
        </div>

        <hr />

        <div className="gov-notice">
          <strong>Navigation:</strong> Use the &quot;Previous&quot; and &quot;Next&quot; buttons
          at the top of each page to navigate between sections. The page indicator at the top
          shows your current progress. Section 2 will remain locked until Sections 1 and 3
          are both completed.
        </div>

        <div className="gov-notice">
          <strong>Note on Processing:</strong> The system may experience delays when processing
          your submissions. Please be patient after clicking navigation buttons &mdash; do not
          click multiple times. There may be no visual indication that processing is in progress.
        </div>
      </div>

      <div className="gov-section">
        <h2>Current Status</h2>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Section</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Section 1</td>
              <td>Basic Personal Information</td>
              <td>{completedPages.includes("page1") ? "Completed" : "Incomplete"}</td>
            </tr>
            <tr>
              <td>Section 3</td>
              <td>Contact Information</td>
              <td>{completedPages.includes("page3") ? "Completed" : "Incomplete"}</td>
            </tr>
            <tr>
              <td>Section 2</td>
              <td>Travel Document Information</td>
              <td>
                {completedPages.includes("page2")
                  ? "Completed"
                  : completedPages.includes("page1") && completedPages.includes("page3")
                  ? "Unlocked"
                  : "Locked"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <Link href="/form/page1">
          <button type="button" className="gov-btn gov-btn-primary" style={{ padding: "8px 32px", fontSize: "14px" }}>
            Begin Form &raquo;
          </button>
        </Link>
      </div>

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <Link href="/state-manage" style={{ fontSize: "11px" }}>
          Administrative State Management
        </Link>
      </div>
    </div>
  );
}

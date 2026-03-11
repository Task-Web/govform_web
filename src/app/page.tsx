"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCookieOverride } from "@/hooks/use-cookie-override";
import { useStateApi } from "@/hooks/use-state-api";
import type { GovFormStateData, Page3Data } from "@/lib/types";

function isPage3Filled(page3: Page3Data): boolean {
  return !!(
    page3.email &&
    page3.phone &&
    page3.address &&
    page3.city &&
    page3.postal_code &&
    page3.country
  );
}

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

  const stateData = state?.state?.data as GovFormStateData | undefined;
  const completedPages = stateData?.completed_pages || [];
  const page3Data = stateData?.form?.page3;
  const page3Filled = page3Data ? isPage3Filled(page3Data) : false;

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
          <strong>IMPORTANT:</strong> This form consists of three (3) sections. Please note
          that Section 2 requires Section 3 to be completed first. Follow the steps below.
        </div>

        <div className="gov-tut-step">
          <strong>Step 1 &mdash; Basic Personal Information (Section 1)</strong><br />
          Begin by navigating to Section 1. Fill in your full legal name, date of birth,
          gender, and nationality. All fields marked with an asterisk (<span style={{ color: "red" }}>*</span>)
          are mandatory. Click &quot;Next&quot; to proceed when finished.
        </div>

        <div className="gov-tut-step">
          <strong>Step 2 &mdash; Travel Document Information (Section 2)</strong><br />
          Section 2 contains travel document fields. However, <strong>all fields in Section 2
          will be disabled</strong> until you have completed all required fields in Section 3
          (Contact Information). You may navigate through Section 2, but you will not be able
          to enter any data until Section 3 is filled. We recommend proceeding to Section 3
          first, then returning to Section 2.
        </div>

        <div className="gov-tut-step">
          <strong>Step 3 &mdash; Contact Information (Section 3)</strong><br />
          Provide your email address, telephone number, and mailing address. Once all
          required fields in this section are completed, the fields in Section 2 will
          become editable. You may then navigate back to Section 2 to complete it.
        </div>

        <hr />

        <div className="gov-notice">
          <strong>Navigation:</strong> Use the &quot;Previous&quot; and &quot;Next&quot; buttons
          at the top of each page to navigate between sections. The page indicator at the top
          shows your current progress.
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
              <td>Section 2</td>
              <td>Travel Document Information</td>
              <td>
                {completedPages.includes("page2")
                  ? "Completed"
                  : page3Filled
                  ? "Unlocked"
                  : "Fields Disabled (Complete Section 3 first)"}
              </td>
            </tr>
            <tr>
              <td>Section 3</td>
              <td>Contact Information</td>
              <td>{completedPages.includes("page3") ? "Completed" : "Incomplete"}</td>
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

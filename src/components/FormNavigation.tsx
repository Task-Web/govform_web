"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import type { Page1Data, Page2Data, Page3Data } from "@/lib/types";

function isPage1Complete(data: Page1Data): boolean {
  return !!(
    data.first_name &&
    data.last_name &&
    data.date_of_birth &&
    data.gender &&
    data.nationality
  );
}

function isPage2Complete(data: Page2Data): boolean {
  return !!(
    data.passport_number &&
    data.visa_type &&
    data.travel_purpose &&
    data.arrival_date &&
    data.departure_date
  );
}

function isPage3Complete(data: Page3Data): boolean {
  return !!(
    data.email &&
    data.phone &&
    data.address &&
    data.city &&
    data.postal_code &&
    data.country
  );
}

function isPageComplete(
  page: string,
  formData: Page1Data | Page2Data | Page3Data
): boolean {
  switch (page) {
    case "page1":
      return isPage1Complete(formData as Page1Data);
    case "page2":
      return isPage2Complete(formData as Page2Data);
    case "page3":
      return isPage3Complete(formData as Page3Data);
    default:
      return false;
  }
}

interface FormNavigationProps {
  currentPage: "page1" | "page2" | "page3";
  completedPages: string[];
  formData: Page1Data | Page2Data | Page3Data;
}

const PAGE_ORDER = ["page1", "page2", "page3"];
const PAGE_LABELS: Record<string, string> = {
  page1: "Section 1: Personal Info",
  page2: "Section 2: Travel Documents",
  page3: "Section 3: Contact Info",
};

export default function FormNavigation({
  currentPage,
  completedPages,
  formData,
}: FormNavigationProps) {
  const router = useRouter();
  const currentIndex = PAGE_ORDER.indexOf(currentPage);
  const pendingRef = useRef(false);

  const prevPage = currentIndex > 0 ? PAGE_ORDER[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGE_ORDER.length - 1 ? PAGE_ORDER[currentIndex + 1] : null;

  const saveAndNavigate = useCallback(
    async (targetPage: string) => {
      if (pendingRef.current) return;
      pendingRef.current = true;

      const complete = isPageComplete(currentPage, formData);
      let updatedCompleted: string[];
      if (complete && !completedPages.includes(currentPage)) {
        updatedCompleted = [...completedPages, currentPage];
      } else if (!complete && completedPages.includes(currentPage)) {
        updatedCompleted = completedPages.filter((p) => p !== currentPage);
      } else {
        updatedCompleted = completedPages;
      }

      await api.patchState({
        data: {
          form: { [currentPage]: formData },
          completed_pages: updatedCompleted,
        },
      });

      router.push(targetPage.startsWith("/") ? targetPage : `/form/${targetPage}`);
    },
    [currentPage, formData, completedPages, router]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, targetPage: string) => {
      e.currentTarget.blur();
      saveAndNavigate(targetPage);
    },
    [saveAndNavigate]
  );

  return (
    <>
      {/* Step indicator */}
      <div className="gov-steps">
        {PAGE_ORDER.map((page) => {
          let className = "gov-step";
          if (page === currentPage) className += " active";
          else if (completedPages.includes(page)) className += " completed";
          return (
            <div key={page} className={className}>
              {PAGE_LABELS[page]}
              {completedPages.includes(page) && page !== currentPage && " \u2713"}
            </div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="gov-nav-bar">
        <div>
          <button
            type="button"
            className="gov-btn"
            onClick={(e) => prevPage && handleClick(e, prevPage)}
            disabled={!prevPage}
          >
            &laquo; Previous
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {PAGE_LABELS[currentPage]}
        </div>
        <div>
          {currentPage === "page3" ? (
            <button
              type="button"
              className="gov-btn gov-btn-primary"
              onClick={(e) => handleClick(e, "/")}
            >
              Submit Form
            </button>
          ) : (
            <button
              type="button"
              className="gov-btn gov-btn-primary"
              onClick={(e) => nextPage && handleClick(e, nextPage)}
              disabled={!nextPage}
            >
              Next &raquo;
            </button>
          )}
        </div>
      </div>
    </>
  );
}

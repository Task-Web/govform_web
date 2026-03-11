"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api } from "@/lib/api-client";
import type { Page1Data, Page2Data, Page3Data } from "@/lib/types";

interface FormNavigationProps {
  currentPage: "page1" | "page2" | "page3";
  completedPages: string[];
  formData: Page1Data | Page2Data | Page3Data;
  onSaveComplete?: () => void;
}

const PAGE_ORDER = ["page1", "page3", "page2"];
const PAGE_LABELS: Record<string, string> = {
  page1: "Section 1: Personal Info",
  page3: "Section 3: Contact Info",
  page2: "Section 2: Travel Documents",
};

export default function FormNavigation({
  currentPage,
  completedPages,
  formData,
  onSaveComplete,
}: FormNavigationProps) {
  const router = useRouter();
  const currentIndex = PAGE_ORDER.indexOf(currentPage);

  const prevPage = currentIndex > 0 ? PAGE_ORDER[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGE_ORDER.length - 1 ? PAGE_ORDER[currentIndex + 1] : null;

  const isPage2Locked =
    !completedPages.includes("page1") || !completedPages.includes("page3");

  const canGoNext = nextPage && !(nextPage === "page2" && isPage2Locked);

  const saveAndNavigate = useCallback(
    async (targetPage: string) => {
      // Save current page data (this call goes through backend with delay)
      await api.patchState({
        data: {
          form: { [currentPage]: formData },
        },
      });
      onSaveComplete?.();
      router.push(`/form/${targetPage}`);
    },
    [currentPage, formData, router, onSaveComplete]
  );

  const handlePrevious = useCallback(() => {
    if (prevPage) {
      saveAndNavigate(prevPage);
    }
  }, [prevPage, saveAndNavigate]);

  const handleNext = useCallback(() => {
    if (canGoNext && nextPage) {
      saveAndNavigate(nextPage);
    }
  }, [canGoNext, nextPage, saveAndNavigate]);

  return (
    <>
      {/* Step indicator */}
      <div className="gov-steps">
        {PAGE_ORDER.map((page) => {
          let className = "gov-step";
          if (page === currentPage) className += " active";
          else if (completedPages.includes(page)) className += " completed";
          else if (page === "page2" && isPage2Locked) className += " locked";
          return (
            <div key={page} className={className}>
              {PAGE_LABELS[page]}
              {completedPages.includes(page) && page !== currentPage && " \u2713"}
              {page === "page2" && isPage2Locked && page !== currentPage && " [Locked]"}
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
            onClick={handlePrevious}
            disabled={!prevPage}
          >
            &laquo; Previous
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {PAGE_LABELS[currentPage]}
        </div>
        <div>
          {currentPage === "page2" ? (
            <button
              type="button"
              className="gov-btn gov-btn-primary"
              onClick={async () => {
                await api.patchState({
                  data: {
                    form: { [currentPage]: formData },
                    completed_pages: [...completedPages.filter((p) => p !== "page2"), "page2"],
                  },
                });
                onSaveComplete?.();
                router.push("/");
              }}
            >
              Submit Form
            </button>
          ) : (
            <button
              type="button"
              className="gov-btn gov-btn-primary"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              Next &raquo;
            </button>
          )}
        </div>
      </div>
    </>
  );
}

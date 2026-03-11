"use client";

import { useEffect, useState } from "react";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/constants";

function applyCookieFromQuery(): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const override = url.searchParams.get("cookie");
  if (!override) return false;

  let cookie = `${COOKIE_NAME}=${encodeURIComponent(override)}; Path=/; SameSite=Lax`;
  if (Number.isFinite(COOKIE_MAX_AGE) && COOKIE_MAX_AGE > 0) {
    cookie += `; Max-Age=${Math.floor(COOKIE_MAX_AGE)}`;
  }
  document.cookie = cookie;

  const redirectUrl = url.origin + url.pathname;
  if (window.location.href !== redirectUrl) {
    window.location.replace(redirectUrl);
    return true;
  }
  return false;
}

export function useCookieOverride(): { ready: boolean } {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const redirected = applyCookieFromQuery();
    if (!redirected) {
      setReady(true);
    }
  }, []);

  return { ready };
}

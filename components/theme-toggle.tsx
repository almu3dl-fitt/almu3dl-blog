"use client";

import { useState } from "react";

import { THEME_COOKIE_NAME, type SiteTheme } from "@/lib/theme";

type ThemeToggleProps = {
  initialTheme: SiteTheme;
};

function applyTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme;
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  const [theme, setTheme] = useState<SiteTheme>(initialTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  function handleToggle() {
    const updatedTheme: SiteTheme = theme === "dark" ? "light" : "dark";
    applyTheme(updatedTheme);
    setTheme(updatedTheme);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="theme-toggle inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
      aria-label={nextTheme === "light" ? "تفعيل وضع النهار" : "تفعيل وضع الليل"}
      title={nextTheme === "light" ? "تفعيل وضع النهار" : "تفعيل وضع الليل"}
    >
      <span className="theme-toggle-icon inline-flex h-5 w-5 items-center justify-center">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M14.8 3.3a1 1 0 0 1 .9 1.5 8 8 0 1 0 3.5 10.7 1 1 0 0 1 1.7 1A10 10 0 1 1 13.4 3.4a1 1 0 0 1 1.4-.1Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.5-4.5a1 1 0 0 1 1 1 1 1 0 1 1-2 0 1 1 0 0 1 1-1Zm-15 0a1 1 0 0 1 1 1 1 1 0 1 1-2 0 1 1 0 0 1 1-1Zm11.3-5.3a1 1 0 0 1 1.4 0l1 1a1 1 0 1 1-1.4 1.4l-1-1a1 1 0 0 1 0-1.4ZM7.3 14.9a1 1 0 0 1 1.4 0l1 1a1 1 0 0 1-1.4 1.4l-1-1a1 1 0 0 1 0-1.4Zm10.4 0a1 1 0 0 1 0 1.4l-1 1a1 1 0 0 1-1.4-1.4l1-1a1 1 0 0 1 1.4 0ZM9.7 6.7a1 1 0 0 1 0 1.4l-1 1A1 1 0 1 1 7.3 7.7l1-1a1 1 0 0 1 1.4 0ZM12 17a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1Z" />
          </svg>
        )}
      </span>
      <span className="hidden sm:inline">{nextTheme === "light" ? "وضع النهار" : "وضع الليل"}</span>
    </button>
  );
}

export const THEME_COOKIE_NAME = "theme";

export type SiteTheme = "dark" | "light";

export function resolveTheme(value?: string | null): SiteTheme {
  return value === "light" ? "light" : "dark";
}


import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";
import type { SiteTheme } from "@/lib/theme";

type SiteHeaderProps = {
  theme: SiteTheme;
};

export function SiteHeader({ theme }: SiteHeaderProps) {
  return (
    <header className="theme-header sticky top-0 z-40 backdrop-blur-xl">
      <div className="site-container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-4">
            <BrandMark />
            <span className="flex flex-col">
              <span className="display-heading brand-gradient-text text-[1.05rem] font-black md:text-[1.22rem]">
                {SITE_NAME}
              </span>
              <span className="theme-text-muted mt-1 text-xs transition group-hover:text-[var(--gold)]">
                {SITE_TAGLINE}
              </span>
            </span>
          </Link>

          <Link
            href="/articles"
            className="theme-pill-active inline-flex rounded-full px-4 py-2 text-sm font-semibold md:hidden"
          >
            الأرشيف
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SiteNav />
          <ThemeToggle initialTheme={theme} />

          <Link
            href="/articles"
            className="theme-button-primary hidden rounded-full px-5 py-2.5 text-sm font-bold md:inline-flex"
          >
            تصفّح المقالات
          </Link>
        </div>
      </div>
    </header>
  );
}

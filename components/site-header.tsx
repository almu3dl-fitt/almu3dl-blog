import Link from "next/link";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-[rgba(7,9,12,0.82)] backdrop-blur-xl">
      <div className="site-container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex flex-col">
            <span className="display-heading text-lg font-black tracking-[0.02em] text-white">
              {SITE_NAME}
            </span>
            <span className="text-xs text-[#A9A294] transition group-hover:text-[#D4AF37]">
              {SITE_TAGLINE}
            </span>
          </Link>

          <Link
            href="/articles"
            className="inline-flex rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#F3D98C] transition hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/16 md:hidden"
          >
            الأرشيف
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SiteNav />

          <Link
            href="/articles"
            className="hidden rounded-full border border-[#D4AF37]/35 bg-[#D4AF37] px-4 py-2 text-sm font-bold text-[#080808] transition hover:translate-y-[-1px] hover:bg-[#E5C25B] md:inline-flex"
          >
            تصفّح المقالات
          </Link>
        </div>
      </div>
    </header>
  );
}

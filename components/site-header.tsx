import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0B0B0B]/85 backdrop-blur-xl">
      <div className="site-container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-4">
            <BrandMark />
            <span className="flex flex-col">
              <span className="display-heading brand-gradient-text text-[1.05rem] font-black md:text-[1.22rem]">
                {SITE_NAME}
              </span>
              <span className="mt-1 text-xs text-[#8F887E] transition group-hover:text-[#D4AF37]">
                {SITE_TAGLINE}
              </span>
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
            className="hidden rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-black shadow-[0_14px_40px_rgba(212,175,55,0.18)] transition hover:translate-y-[-1px] hover:bg-[#E5C25B] md:inline-flex"
          >
            تصفّح المقالات
          </Link>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

import {
  CATEGORY_DEFINITIONS,
  FOOTER_LINKS,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/6 bg-[#080A0D]">
      <div className="site-container grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div className="space-y-4">
          <div className="display-heading text-xl font-black text-white">
            {SITE_NAME}
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#B8B2A7]">
            {SITE_DESCRIPTION} واجهة عربية داكنة، نظيفة، ومبنية لتجربة قراءة
            مريحة وسريعة بدون ضجيج بصري.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8E8677]">
            الصفحات
          </div>
          <div className="flex flex-col gap-3 text-sm text-[#D7D1C6]">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[#F3D98C]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8E8677]">
            التصنيفات
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_DEFINITIONS.map((category) => (
              <Link
                key={category.slug}
                href={`/articles?category=${category.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#D7D1C6] transition hover:border-[#D4AF37]/35 hover:text-[#F3D98C]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

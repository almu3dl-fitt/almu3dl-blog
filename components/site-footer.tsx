import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import {
  CATEGORY_DEFINITIONS,
  FOOTER_LINKS,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/40">
      <div className="site-container space-y-8 py-10">
        <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <BrandMark size="lg" />
              <div>
                <div className="display-heading brand-gradient-text text-lg font-black">
                  {SITE_NAME}
                </div>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[#B8B2A7]">
                  {SITE_DESCRIPTION} تجربة عربية داكنة ومركّزة، مصممة للقراءة
                  الطويلة بدون ضجيج أو ملاحقة بصريّة.
                </p>
              </div>
            </div>
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
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm text-[#A7A29A] md:flex-row">
          <div>© 2026 المعضّل • Almu3dl — مدونة اللياقة والتغذية</div>
          <div>روابط التواصل تبقى في الفوتر فقط حفاظًا على تجربة قراءة نظيفة.</div>
        </div>
      </div>
    </footer>
  );
}

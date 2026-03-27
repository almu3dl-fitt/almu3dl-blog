import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { CONTACT_FORM_TO_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "نموذج التواصل المباشر مع المعضّل للاستفسارات والملاحظات والدعم.",
};

const contactTopics = [
  "ملاحظات على المحتوى",
  "إبلاغ عن مشكلة تقنية",
  "استفسار عام",
  "تعاون أو شراكة مناسبة",
] as const;

export default function ContactPage() {
  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="panel-surface rounded-[34px] p-8 md:p-10">
            <div className="section-kicker mb-4">تواصل معنا</div>
            <h1 className="display-heading text-4xl font-black leading-[1.2] text-white md:text-5xl">
              تواصل مباشر
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#B8B2A8] md:text-lg">
              للاستفسارات، الملاحظات، أو الرسائل المرتبطة بالموقع والمحتوى، يمكن
              استخدام النموذج مباشرة أو مراسلتنا عبر البريد.
            </p>

            <div className="mt-8 rounded-[28px] border border-[#D4AF37]/15 bg-[#0D0D0D] p-5">
              <div className="text-sm text-[#8E8677]">البريد المباشر</div>
              <a
                href={`mailto:${CONTACT_FORM_TO_EMAIL}`}
                className="mt-3 inline-flex text-lg font-bold text-[#F3D98C] transition hover:text-white"
                dir="ltr"
              >
                {CONTACT_FORM_TO_EMAIL}
              </a>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-sm font-semibold text-white">مناسب لـ</div>
              <div className="flex flex-wrap gap-2">
                {contactTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-[#D7D1C6]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <ContactForm />
        </section>
      </div>
    </main>
  );
}

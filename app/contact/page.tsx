import type { Metadata } from "next";

const CONTACT_EMAIL = "almu3dl@gmail.com";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "التواصل المباشر مع المعضّل عبر البريد الإلكتروني.",
};

const contactTopics = [
  "الاستفسارات العامة",
  "ملاحظات على المحتوى",
  "الإبلاغ عن مشكلة تقنية",
  "التعاون المناسب",
] as const;

export default function ContactPage() {
  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="panel-surface rounded-[34px] p-8 md:p-10">
            <div className="section-kicker mb-4">تواصل معنا</div>
            <h1 className="display-heading text-4xl font-black leading-[1.2] text-white md:text-5xl">
              البريد المباشر
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#B8B2A8] md:text-lg">
              للتواصل بخصوص المحتوى أو الموقع أو أي استفسار عام، يمكن المراسلة
              مباشرة عبر البريد التالي.
            </p>

            <div className="mt-8 rounded-[28px] border border-[#D4AF37]/15 bg-[#0D0D0D] p-6">
              <div className="text-sm text-[#8E8677]">البريد الإلكتروني</div>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex text-lg font-bold text-[#F3D98C] transition hover:text-white sm:text-xl"
                dir="ltr"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="mt-6">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black transition hover:translate-y-[-1px] hover:bg-[#E5C25B]"
              >
                افتح البريد
              </a>
            </div>
          </section>

          <section className="panel-surface rounded-[34px] p-8 md:p-10">
            <div className="mb-4 text-lg font-black text-white">مناسب لـ</div>
            <div className="flex flex-wrap gap-3">
              {contactTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#D7D1C6]"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-6">
              <div className="text-sm leading-8 text-[#CFC8BC]">
                عند المراسلة، يُفضّل كتابة عنوان واضح للرسالة وإيضاح التفاصيل
                الأساسية داخل البريد لتسهيل المتابعة والرد.
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

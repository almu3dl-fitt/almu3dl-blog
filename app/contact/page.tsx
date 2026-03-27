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
            <h1 className="display-heading theme-text-main text-4xl font-black leading-[1.2] md:text-5xl">
              البريد المباشر
            </h1>
            <p className="theme-text-soft mt-5 max-w-3xl text-base leading-8 md:text-lg">
              للتواصل بخصوص المحتوى أو الموقع أو أي استفسار عام، يمكن المراسلة
              مباشرة عبر البريد التالي.
            </p>

            <div className="theme-inset-card-strong mt-8 rounded-[28px] p-6">
              <div className="theme-text-muted text-sm">البريد الإلكتروني</div>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex text-lg font-bold text-[var(--gold-soft)] transition hover:text-[var(--fg)] sm:text-xl"
                dir="ltr"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="mt-6">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="theme-button-primary inline-flex rounded-full px-6 py-3 text-sm font-bold"
              >
                افتح البريد
              </a>
            </div>
          </section>

          <section className="panel-surface rounded-[34px] p-8 md:p-10">
            <div className="theme-text-main mb-4 text-lg font-black">مناسب لـ</div>
            <div className="flex flex-wrap gap-3">
              {contactTopics.map((topic) => (
                <span
                  key={topic}
                  className="theme-pill rounded-full px-4 py-2 text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="theme-inset-card mt-8 rounded-[28px] p-6">
              <div className="theme-text-soft text-sm leading-8">
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

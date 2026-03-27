import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تواصل",
  description: "صفحة التواصل الخاصة بمشروع المعضّل.",
};

export default function ContactPage() {
  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="panel-surface rounded-[34px] p-7 md:p-10">
          <div className="section-kicker mb-4">Contact</div>
          <h1 className="display-heading text-4xl font-black text-white md:text-5xl">
            تواصل مع المعضّل
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#C8C2B7] md:text-lg">
            هذه الصفحة مخصصة لتنظيم قنوات التواصل التحريري والتجاري الخاصة
            بالمشروع. لا يتم عرض روابط التواصل داخل الواجهة إلا من خلال الفوتر،
            حفاظًا على تجربة نظيفة وغير مشتتة.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              التحرير
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              لمراجعة المحتوى، اقتراح مواضيع جديدة، أو إرسال ملاحظات حول الجودة
              التحريرية والبنية.
            </p>
          </div>
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              الشراكات
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              للتعاونات، الرعايات المدروسة، أو المشاريع التي تتقاطع مع هوية
              المعضّل الرياضية والصحية.
            </p>
          </div>
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              الدعم التقني
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              للإبلاغ عن رابط مكسور، مشكلة عرض، أو خلل في أرشفة المقالات أو
              التنقل داخل الموقع.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

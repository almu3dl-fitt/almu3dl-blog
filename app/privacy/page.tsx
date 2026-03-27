import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "مبادئ الخصوصية والاستخدام الخاصة بمنصة المعضّل.",
};

export default function PrivacyPage() {
  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="panel-surface rounded-[34px] p-7 md:p-10">
          <div className="section-kicker mb-4">Privacy</div>
          <h1 className="display-heading text-4xl font-black text-white md:text-5xl">
            سياسة الخصوصية
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#C8C2B7] md:text-lg">
            يلتزم المعضّل بتجربة قراءة محترمة وخفيفة، مع الحد الأدنى من جمع
            البيانات اللازمة لاستقرار الموقع وحمايته وتحسين الأداء العام.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              البيانات الأساسية
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              قد تتم معالجة بيانات تقنية عامة مثل نوع المتصفح، الصفحات المطلوبة،
              وسجلات الأخطاء لأغراض الأمان وتحسين الاعتمادية فقط.
            </p>
          </div>
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              ملفات الارتباط
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              أي استخدام لملفات الارتباط أو التخزين المحلي يجب أن يكون وظيفيًا
              أو تحليليًا بحدود واضحة، دون واجهات مزعجة أو تتبع مبالغ فيه.
            </p>
          </div>
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              مشاركة البيانات
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              لا يُبنى هذا المشروع على بيع بيانات المستخدمين أو إعادة تسويقها.
              أي تكاملات مستقبلية يجب أن تخضع لنفس المبدأ.
            </p>
          </div>
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              تحديثات السياسة
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              قد يتم تحديث هذه الصفحة مع تطور خدمات الموقع أو إضافة قنوات تواصل
              أو أدوات تحليل جديدة، مع الحفاظ على الوضوح والشفافية.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

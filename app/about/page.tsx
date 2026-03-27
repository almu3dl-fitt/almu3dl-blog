import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "عن المعضّل",
  description: "تعرف على رؤية المعضّل ونهجه التحريري في محتوى اللياقة والتغذية.",
};

export default function AboutPage() {
  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="panel-surface rounded-[34px] p-7 md:p-10">
          <div className="section-kicker mb-4">About The Project</div>
          <h1 className="display-heading text-4xl font-black text-white md:text-5xl">
            عن المعضّل
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#C8C2B7] md:text-lg">
            المعضّل منصة عربية تركّز على محتوى اللياقة والتغذية بأسلوب تحريري
            واضح، سريع، وعملي. الهدف ليس إغراق القارئ، بل منحه تجربة نظيفة
            تساعده على اتخاذ قرار أفضل في التمرين، الأكل، والاستشفاء.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              الرؤية
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              بناء مرجع عربي حديث لموضوعات اللياقة والتغذية يوازن بين الفائدة
              العملية والهوية البصرية الراقية.
            </p>
          </div>
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              الأسلوب
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              تجربة داكنة، محررة بعناية، minimal وperformance-focused، مع احترام
              كامل للعربية والـ RTL والقراءة الطويلة.
            </p>
          </div>
          <div className="panel-surface rounded-[30px] p-6">
            <h2 className="display-heading text-2xl font-black text-white">
              التركيز
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#C7C0B3]">
              اللياقة، التغذية الرياضية، خسارة الدهون، بناء العضلات، المكملات،
              الصحة العامة، والوصفات الصحية.
            </p>
          </div>
        </section>

        <section className="panel-surface rounded-[34px] p-7 md:p-9">
          <h2 className="display-heading text-3xl font-black text-white">
            ماذا يميز التجربة؟
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-[#C7C0B3]">
              بنية محتوى قابلة للتوسع، مدعومة بقاعدة بيانات حقيقية ومسارات
              واضحة للمقالات.
            </div>
            <div className="rounded-[26px] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-[#C7C0B3]">
              تصميم عربي مريح للقراءة بدون ويدجتات ملاحقة أو عناصر مزعجة.
            </div>
            <div className="rounded-[26px] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-[#C7C0B3]">
              اعتماد fallback بصري محلي للصور لتقليل الهشاشة وعدم ربط المشروع
              بخدمات خارجية غير مستقرة.
            </div>
            <div className="rounded-[26px] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-[#C7C0B3]">
              تجهيز المشروع ليتوسع لاحقًا في الـ SEO، إدارة المحتوى، وتحسينات
              الأداء دون إعادة بناء من الصفر.
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/articles"
              className="inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#080808] hover:bg-[#E5C25B]"
            >
              تصفّح المقالات
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

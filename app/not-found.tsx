import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-main flex items-center">
      <div className="site-container">
        <div className="panel-surface mx-auto max-w-3xl rounded-[34px] p-8 text-center md:p-10">
          <div className="section-kicker mb-4">404</div>
          <h1 className="display-heading text-3xl font-black text-white md:text-4xl">
            الصفحة المطلوبة غير متاحة
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#B8B2A8]">
            الرابط الذي فتحته غير صحيح، أو أن المقال تغيّر مساره، أو أن
            المحتوى لم يعد منشورًا بنفس العنوان السابق.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/articles"
              className="inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#080808] hover:bg-[#E5C25B]"
            >
              الانتقال إلى الأرشيف
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-[#F5F1E8] hover:border-[#D4AF37]/30 hover:text-[#F3D98C]"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

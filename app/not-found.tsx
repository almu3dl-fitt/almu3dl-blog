import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-main flex items-center">
      <div className="site-container">
        <div className="panel-surface mx-auto max-w-3xl rounded-[34px] p-8 text-center md:p-10">
          <div className="section-kicker mb-4">404</div>
          <h1 className="display-heading theme-text-main text-3xl font-black md:text-4xl">
            الصفحة المطلوبة غير متاحة
          </h1>
          <p className="theme-text-soft mx-auto mt-4 max-w-2xl text-base leading-8">
            الرابط الذي فتحته غير صحيح، أو أن المقال تغيّر مساره، أو أن
            المحتوى لم يعد منشورًا بنفس العنوان السابق.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/articles"
              className="theme-button-primary inline-flex rounded-full px-6 py-3 text-sm font-bold"
            >
              الانتقال إلى الأرشيف
            </Link>
            <Link
              href="/"
              className="theme-button-secondary inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

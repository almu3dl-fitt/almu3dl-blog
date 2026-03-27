import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { getArchivePageData, readSearchParam } from "@/lib/posts";

type ArticlesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "الأرشيف",
  description: "تصفح جميع مقالات المعضّل مع فلترة حسب التصنيف والبحث داخل المحتوى.",
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = readSearchParam(resolvedSearchParams.q).trim();
  const categorySlug = readSearchParam(resolvedSearchParams.category).trim();

  const { posts, categorySummaries, selectedCategoryName } = await getArchivePageData({
    query,
    categorySlug,
  });

  const activeChipsQuery = new URLSearchParams();
  if (query) activeChipsQuery.set("q", query);

  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="panel-surface rounded-[34px] p-7 md:p-9">
          <div className="section-kicker mb-4">Article Archive</div>
          <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <h1 className="display-heading text-4xl font-black leading-[1.25] text-white md:text-5xl">
                أرشيف المعضّل
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#C8C2B7] md:text-lg">
                استعرض جميع المقالات المنشورة، صفِّها حسب التصنيف، وابحث داخل
                العناوين والمقتطفات والمحتوى للوصول الأسرع لما تحتاجه.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/8 bg-black/20 px-5 py-4 text-sm text-[#C9C2B5]">
              <div className="text-xs uppercase tracking-[0.18em] text-[#8E8677]">
                النتائج الحالية
              </div>
              <div className="display-heading mt-2 text-3xl font-black text-white">
                {posts.length}
              </div>
            </div>
          </div>

          <form
            action="/articles"
            method="get"
            className="mt-7 grid gap-4 rounded-[28px] border border-white/8 bg-black/20 p-4 md:grid-cols-[1fr_260px_auto]"
          >
            <label className="flex flex-col gap-2 text-sm text-[#D7D1C6]">
              <span className="font-semibold text-white">ابحث داخل المقالات</span>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="ابحث بعنوان المقال أو محتواه"
                className="rounded-2xl border border-white/10 bg-[#11151A] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6F695D] focus:border-[#D4AF37]/35"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#D7D1C6]">
              <span className="font-semibold text-white">التصنيف</span>
              <select
                name="category"
                defaultValue={categorySlug}
                className="rounded-2xl border border-white/10 bg-[#11151A] px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/35"
              >
                <option value="">كل التصنيفات</option>
                {categorySummaries.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="inline-flex rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#080808] hover:bg-[#E5C25B]"
              >
                تطبيق الفلاتر
              </button>
              <Link
                href="/articles"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[#F5F1E8] hover:border-[#D4AF37]/30 hover:text-[#F3D98C]"
              >
                إعادة الضبط
              </Link>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={query ? `/articles?q=${encodeURIComponent(query)}` : "/articles"}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !categorySlug
                  ? "bg-[#D4AF37] text-[#080808]"
                  : "border border-white/10 bg-white/5 text-[#D7D1C6] hover:border-[#D4AF37]/30 hover:text-[#F3D98C]"
              }`}
            >
              الكل
            </Link>
            {categorySummaries.map((category) => {
              const chipParams = new URLSearchParams(activeChipsQuery);
              chipParams.set("category", category.slug);

              return (
                <Link
                  key={category.slug}
                  href={`/articles?${chipParams.toString()}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    categorySlug === category.slug
                      ? "bg-[#D4AF37] text-[#080808]"
                      : "border border-white/10 bg-white/5 text-[#D7D1C6] hover:border-[#D4AF37]/30 hover:text-[#F3D98C]"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </section>

        {(query || selectedCategoryName) && (
          <section className="flex flex-wrap items-center gap-3 rounded-[28px] border border-white/8 bg-black/20 p-4 text-sm text-[#D7D1C6]">
            {selectedCategoryName ? (
              <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/12 px-4 py-2 text-[#F3D98C]">
                التصنيف: {selectedCategoryName}
              </span>
            ) : null}
            {query ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                البحث: {query}
              </span>
            ) : null}
          </section>
        )}

        {posts.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </section>
        ) : (
          <section className="panel-surface rounded-[32px] p-8 text-center">
            <h2 className="display-heading text-2xl font-black text-white">
              لا توجد نتائج مطابقة حاليًا
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#B8B2A8]">
              جرّب تقليل كلمات البحث أو إزالة الفلتر الحالي للوصول إلى نطاق أوسع
              من المقالات.
            </p>
            <div className="mt-6">
              <Link
                href="/articles"
                className="inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#080808] hover:bg-[#E5C25B]"
              >
                عرض جميع المقالات
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

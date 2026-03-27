import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-kicker mb-4">Article Archive</div>
              <h1 className="display-heading text-4xl font-black leading-[1.25] text-white md:text-5xl">
                أرشيف المعضّل
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#C8C2B7] md:text-lg">
                استعرض جميع المقالات المنشورة، صفِّها حسب التصنيف، وابحث داخل
                العناوين والمقتطفات والمحتوى للوصول الأسرع لما تحتاجه.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-[#111111] px-4 py-3 text-sm text-[#A7A29A]">
              <span className="display-heading font-black text-white">
                {posts.length}
              </span>{" "}
              مقال
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-[30px] border border-white/10 bg-[#111111] p-5 md:p-6">
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
          <section className="grid gap-5 lg:grid-cols-[270px_1fr]">
            <aside className="panel-surface h-fit rounded-[26px] p-5">
              <form action="/articles" method="get" className="space-y-5">
                <div>
                  <div className="mb-3 text-sm text-[#A7A29A]">بحث</div>
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="ابحث في المقالات"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-[#7D766D] focus:border-[#D4AF37]/40"
                  />
                </div>

                <div>
                  <div className="mb-3 text-sm text-[#A7A29A]">التصنيف</div>
                  <div className="space-y-2">
                    <label className="block">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        defaultChecked={!categorySlug}
                        className="peer sr-only"
                      />
                      <span className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm text-[#D7D0C5] transition peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37] peer-checked:font-bold peer-checked:text-black hover:border-[#D4AF37]/35">
                        الكل
                      </span>
                    </label>
                    {categorySummaries.map((category) => (
                      <label key={category.slug} className="block">
                        <input
                          type="radio"
                          name="category"
                          value={category.slug}
                          defaultChecked={categorySlug === category.slug}
                          className="peer sr-only"
                        />
                        <span className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm text-[#D7D0C5] transition peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37] peer-checked:font-bold peer-checked:text-black hover:border-[#D4AF37]/35">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-bold text-black"
                  >
                    تطبيق
                  </button>
                  <Link
                    href="/articles"
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[#F5F1E8]"
                  >
                    إعادة
                  </Link>
                </div>
              </form>
            </aside>

            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F0F0F] transition hover:border-[#D4AF37]/25"
                >
                  <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                    <div className="relative min-h-[220px] bg-black">
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 280px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-between gap-4 p-5 md:p-6">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#A7A29A]">
                          <span className="rounded-full bg-[#D4AF37]/90 px-3 py-1 font-bold text-black">
                            {post.category.name}
                          </span>
                          <span>{post.publishedLabel}</span>
                          <span className="h-1 w-1 rounded-full bg-[#6F6A63]" />
                          <span>{post.readingTime}</span>
                        </div>
                        <h2 className="display-heading mb-3 text-2xl font-black leading-9 text-white transition hover:text-[#F0D36A]">
                          {post.title}
                        </h2>
                        <p className="max-w-3xl leading-8 text-[#B8B2A8]">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Link
                          href={post.href}
                          className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:border-[#D4AF37]/40 hover:text-[#F0D36A]"
                        >
                          اقرأ المقال
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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

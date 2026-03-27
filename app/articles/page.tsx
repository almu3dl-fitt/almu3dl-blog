import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArchivePageData, readSearchParam } from "@/lib/posts";
import { getStoreHighlight, STORE_URL } from "@/lib/site";

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
  const storeHighlight = getStoreHighlight(selectedCategoryName);

  const activeChipsQuery = new URLSearchParams();
  if (query) activeChipsQuery.set("q", query);

  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-kicker mb-4">الأرشيف</div>
              <h1 className="display-heading theme-text-main text-4xl font-black leading-[1.25] md:text-5xl">
                أرشيف المعضّل
              </h1>
              <p className="theme-text-soft mt-4 max-w-3xl text-base leading-8 md:text-lg">
                استعرض جميع المقالات المنشورة، صفِّها حسب التصنيف، وابحث داخل
                العناوين والمقتطفات والمحتوى للوصول الأسرع لما تحتاجه.
              </p>
            </div>

            <div className="theme-card-soft rounded-full px-4 py-3 text-sm theme-text-muted">
              <span className="display-heading theme-text-main font-black">
                {posts.length}
              </span>{" "}
              مقال
            </div>
          </div>

          <div className="theme-card-soft flex flex-wrap gap-2 rounded-[30px] p-5 md:p-6">
            <Link
              href={query ? `/articles?q=${encodeURIComponent(query)}` : "/articles"}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !categorySlug ? "theme-pill-active" : "theme-pill"
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
                    categorySlug === category.slug ? "theme-pill-active" : "theme-pill"
                  }`}
                >
                  {category.name}
                </Link>
                );
              })}
          </div>
        </section>

        {(query || selectedCategoryName) && (
          <section className="theme-inset-card theme-text-soft flex flex-wrap items-center gap-3 rounded-[28px] p-4 text-sm">
            {selectedCategoryName ? (
              <span className="theme-pill-active rounded-full px-4 py-2">
                التصنيف: {selectedCategoryName}
              </span>
            ) : null}
            {query ? (
              <span className="theme-pill rounded-full px-4 py-2">
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
                  <div className="theme-text-muted mb-3 text-sm">بحث</div>
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="ابحث في المقالات"
                    className="theme-input w-full rounded-2xl px-4 py-3"
                  />
                </div>

                <div>
                  <div className="theme-text-muted mb-3 text-sm">التصنيف</div>
                  <div className="space-y-2">
                    <label className="block">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        defaultChecked={!categorySlug}
                        className="peer sr-only"
                      />
                      <span className="theme-pill block w-full rounded-2xl px-4 py-3 text-right text-sm transition peer-checked:border-[#D4AF37]/40 peer-checked:bg-[#D4AF37] peer-checked:font-bold peer-checked:text-black hover:border-[#D4AF37]/35">
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
                        <span className="theme-pill block w-full rounded-2xl px-4 py-3 text-right text-sm transition peer-checked:border-[#D4AF37]/40 peer-checked:bg-[#D4AF37] peer-checked:font-bold peer-checked:text-black hover:border-[#D4AF37]/35">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="theme-button-primary flex-1 rounded-full px-5 py-3 text-sm font-bold"
                  >
                    تطبيق
                  </button>
                  <Link
                    href="/articles"
                    className="theme-button-secondary rounded-full px-5 py-3 text-sm font-semibold"
                  >
                    إعادة
                  </Link>
                </div>
              </form>

              <div className="theme-inset-card-strong mt-5 rounded-[24px] p-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-soft)]">
                  {storeHighlight.eyebrow}
                </div>
                <div className="theme-text-main mb-3 text-xl font-black">
                  {storeHighlight.title}
                </div>
                <p className="theme-text-soft text-sm leading-7">
                  {storeHighlight.description}
                </p>
                <a
                  href={STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="theme-pill-active mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold hover:bg-[var(--gold)] hover:text-black"
                >
                  {storeHighlight.ctaLabel}
                </a>
              </div>
            </aside>

            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="theme-card-soft-alt overflow-hidden rounded-[28px] transition hover:border-[#D4AF37]/25"
                >
                  <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                    <div className="relative min-h-[220px] bg-[var(--panel-plain-soft)]">
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
                        <div className="theme-text-muted mb-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-[#D4AF37]/90 px-3 py-1 font-bold text-black">
                            {post.category.name}
                          </span>
                          <span>{post.publishedLabel}</span>
                          <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
                          <span>{post.readingTime}</span>
                        </div>
                        <h2 className="display-heading theme-text-main mb-3 text-2xl font-black leading-9 transition hover:text-[var(--gold-soft)]">
                          {post.title}
                        </h2>
                        <p className="theme-text-soft max-w-3xl leading-8">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Link
                          href={post.href}
                          className="theme-button-secondary rounded-full px-5 py-2.5 text-sm font-semibold"
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
            <h2 className="display-heading theme-text-main text-2xl font-black">
              لا توجد نتائج مطابقة حاليًا
            </h2>
            <p className="theme-text-soft mx-auto mt-4 max-w-2xl text-base leading-8">
              جرّب تقليل كلمات البحث أو إزالة الفلتر الحالي للوصول إلى نطاق أوسع
              من المقالات.
            </p>
            <div className="mt-6">
              <Link
                href="/articles"
                className="theme-button-primary inline-flex rounded-full px-6 py-3 text-sm font-bold"
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

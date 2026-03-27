import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { getHomePageData } from "@/lib/posts";
import { getStoreHighlight, STORE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { featuredPost, latestPosts, totalPosts, totalCategories, categorySummaries } =
    await getHomePageData();
  const secondaryPost = latestPosts[0] ?? null;
  const storeHighlight = getStoreHighlight();

  return (
    <main className="page-main">
      <section className="site-container space-y-8 md:space-y-10">
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="panel-surface overflow-hidden rounded-[34px]">
            {featuredPost ? (
              <div className="grid min-h-[520px] lg:grid-cols-[1.12fr_0.88fr]">
                <div className="flex flex-col justify-center bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_35%)] p-8 md:p-10 xl:p-12">
                  <div className="section-kicker mb-4">{featuredPost.category.name}</div>
                  <h1 className="display-heading theme-text-main max-w-[32rem] text-[2.05rem] font-black leading-[1.22] sm:text-[2.25rem] md:text-[2.55rem] xl:text-[2.9rem]">
                    {featuredPost.title}
                  </h1>
                  <p className="theme-text-soft mt-5 max-w-3xl text-[0.97rem] leading-8 md:text-base">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={featuredPost.href}
                      className="theme-button-primary rounded-full px-6 py-3 font-bold transition hover:scale-[1.02]"
                    >
                      اقرأ المقال
                    </Link>
                    <Link
                      href="/articles"
                      className="theme-button-secondary rounded-full px-6 py-3 font-semibold"
                    >
                      تصفح الأرشيف
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
                    <div className="surface-muted rounded-2xl p-4">
                      <div className="mb-1 font-bold text-[var(--gold-soft)]">{totalPosts}+</div>
                      <div className="theme-text-muted">مقال</div>
                    </div>
                    <div className="surface-muted rounded-2xl p-4">
                      <div className="mb-1 font-bold text-[var(--gold-soft)]">{totalCategories}</div>
                      <div className="theme-text-muted">تصنيف</div>
                    </div>
                    <div className="surface-muted rounded-2xl p-4">
                      <div className="mb-1 font-bold text-[var(--gold-soft)]">100%</div>
                      <div className="theme-text-muted">محتوى متخصص</div>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[320px] bg-[var(--panel-plain-soft)]">
                  <div className="absolute inset-0 bg-[url('/articles/categories/strength-performance.svg')] bg-cover bg-center opacity-0" />
                  <ArticleCard post={featuredPost} variant="featured" />
                  {secondaryPost ? (
                    <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
                      <Link
                        href={secondaryPost.href}
                        className="theme-inset-card block w-full rounded-[28px] p-5 text-right backdrop-blur transition hover:border-[#D4AF37]/30"
                      >
                        <div className="mb-2 text-sm text-[var(--gold-soft)]">
                          {secondaryPost.category.name}
                        </div>
                        <div className="theme-text-main mb-3 text-lg font-black leading-snug md:text-[1.35rem]">
                          {secondaryPost.title}
                        </div>
                        <div className="theme-text-soft text-sm">
                          {secondaryPost.readingTime}
                        </div>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="panel-surface rounded-[28px] p-5">
              <div className="theme-text-main mb-4 text-lg font-black">التصنيفات</div>
              <div className="flex flex-wrap gap-2">
                {categorySummaries.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/articles?category=${category.slug}`}
                    className="theme-pill rounded-full px-4 py-2 text-sm"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="panel-surface rounded-[28px] p-5">
              <div className="theme-text-main mb-4 text-lg font-black">ابحث بسرعة</div>
              <form action="/articles" method="get" className="flex gap-2">
                <input
                  name="q"
                  placeholder="ابحث عن مقال أو موضوع"
                  className="theme-input flex-1 rounded-2xl px-4 py-3"
                />
                <button
                  type="submit"
                  className="theme-button-primary rounded-2xl px-5 font-bold"
                >
                  بحث
                </button>
              </form>
            </div>

            <div className="theme-store-card rounded-[28px] p-6">
              <div className="theme-store-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em]">
                {storeHighlight.eyebrow}
              </div>
              <div className="theme-text-main mb-3 text-2xl font-black">
                {storeHighlight.title}
              </div>
              <p className="theme-store-copy mb-5 leading-8">
                {storeHighlight.description}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[#3DDC84] px-5 py-3 font-bold text-black"
                >
                  {storeHighlight.ctaLabel}
                </a>
                <Link
                  href="/about"
                  className="theme-button-secondary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 font-semibold"
                >
                  عن المعضّل
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="section-kicker mb-2">أحدث النشر</div>
              <h2 className="display-heading theme-text-main text-3xl font-black">
                أحدث المقالات
              </h2>
            </div>

            <Link
              href="/articles"
              className="theme-button-secondary hidden rounded-full px-4 py-2 text-sm font-semibold md:inline-flex"
            >
              عرض الأرشيف كاملًا
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {latestPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <div className="section-kicker mb-2">مسارات المحتوى</div>
            <h2 className="display-heading theme-text-main text-3xl font-black">
              مسارات القراءة
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categorySummaries.map((category) => (
              <Link
                key={category.slug}
                href={`/articles?category=${category.slug}`}
                className="panel-surface overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_28%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:border-[#D4AF37]/24"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="display-heading theme-text-main text-xl font-black">
                    {category.name}
                  </div>
                  <div className="theme-pill rounded-full px-3 py-1 text-xs text-[var(--gold-soft)]">
                    {category.postCount} مقال
                  </div>
                </div>
                <p className="theme-text-soft mt-4 text-sm leading-7">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

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
              <div className="grid min-h-[520px] lg:grid-cols-[1.02fr_0.98fr]">
                <div className="flex flex-col justify-center bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_35%)] p-8 md:p-10 xl:p-12">
                  <div className="section-kicker mb-4">{featuredPost.category.name}</div>
                  <h1 className="display-heading max-w-4xl text-4xl font-black leading-[1.2] text-white md:text-5xl xl:text-6xl">
                    {featuredPost.title}
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-[#B8B2A8] md:text-lg">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={featuredPost.href}
                      className="rounded-full bg-[#D4AF37] px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
                    >
                      اقرأ المقال
                    </Link>
                    <Link
                      href="/articles"
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
                    >
                      تصفح الأرشيف
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
                    <div className="surface-muted rounded-2xl p-4">
                      <div className="mb-1 font-bold text-[#F0D36A]">{totalPosts}+</div>
                      <div className="text-[#A7A29A]">مقال</div>
                    </div>
                    <div className="surface-muted rounded-2xl p-4">
                      <div className="mb-1 font-bold text-[#F0D36A]">{totalCategories}</div>
                      <div className="text-[#A7A29A]">تصنيف</div>
                    </div>
                    <div className="surface-muted rounded-2xl p-4">
                      <div className="mb-1 font-bold text-[#F0D36A]">100%</div>
                      <div className="text-[#A7A29A]">محتوى عربي</div>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[320px] bg-black">
                  <div className="absolute inset-0 bg-[url('/articles/categories/strength-performance.svg')] bg-cover bg-center opacity-0" />
                  <ArticleCard post={featuredPost} variant="featured" />
                  {secondaryPost ? (
                    <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
                      <Link
                        href={secondaryPost.href}
                        className="block w-full rounded-[28px] border border-white/10 bg-black/55 p-5 text-right backdrop-blur transition hover:border-[#D4AF37]/30"
                      >
                        <div className="mb-2 text-sm text-[#F0D36A]">
                          {secondaryPost.category.name}
                        </div>
                        <div className="mb-3 text-2xl font-black leading-snug text-white">
                          {secondaryPost.title}
                        </div>
                        <div className="text-sm text-[#B8B2A8]">
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
              <div className="mb-4 text-lg font-black text-white">التصنيفات</div>
              <div className="flex flex-wrap gap-2">
                {categorySummaries.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/articles?category=${category.slug}`}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-[#D4AF37]/35 hover:text-[#F0D36A]"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="panel-surface rounded-[28px] p-5">
              <div className="mb-4 text-lg font-black text-white">ابحث بسرعة</div>
              <form action="/articles" method="get" className="flex gap-2">
                <input
                  name="q"
                  placeholder="ابحث عن مقال أو موضوع"
                  className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-[#7D766D] focus:border-[#D4AF37]/40"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-[#D4AF37] px-5 font-bold text-black"
                >
                  بحث
                </button>
              </form>
            </div>

            <div className="rounded-[28px] border border-[#3DDC84]/20 bg-[linear-gradient(135deg,rgba(61,220,132,0.12),rgba(212,175,55,0.12))] p-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A9EAC7]">
                {storeHighlight.eyebrow}
              </div>
              <div className="mb-3 text-2xl font-black text-white">
                {storeHighlight.title}
              </div>
              <p className="mb-5 leading-8 text-[#D7E8DD]">
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
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-black/20 px-5 py-3 font-semibold text-white"
                >
                  عن المنصة
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="section-kicker mb-2">Latest Articles</div>
              <h2 className="display-heading text-3xl font-black text-white">
                أحدث المقالات
              </h2>
            </div>

            <Link
              href="/articles"
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#F5F1E8] hover:border-[#D4AF37]/30 hover:text-[#F3D98C] md:inline-flex"
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
            <div className="section-kicker mb-2">Editorial Tracks</div>
            <h2 className="display-heading text-3xl font-black text-white">
              مسارات القراءة
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categorySummaries.map((category) => (
              <Link
                key={category.slug}
                href={`/articles?category=${category.slug}`}
                className={`overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_28%),linear-gradient(180deg,rgba(18,21,26,0.96),rgba(9,11,14,0.96))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:border-[#D4AF37]/24`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="display-heading text-xl font-black text-white">
                    {category.name}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#F3D98C]">
                    {category.postCount} مقال
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#BFB8AB]">
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

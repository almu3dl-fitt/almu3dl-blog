import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { getHomePageData } from "@/lib/posts";

export default async function HomePage() {
  const { featuredPost, latestPosts, totalPosts, totalCategories, categorySummaries } =
    await getHomePageData();

  return (
    <main className="page-main">
      <section className="site-container space-y-8 md:space-y-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="panel-surface rounded-[34px] p-7 md:p-9">
            <div className="section-kicker mb-4">Dark Premium Fitness Editorial</div>
            <h1 className="display-heading max-w-4xl text-4xl font-black leading-[1.25] text-white md:text-5xl xl:text-6xl">
              محتوى عربي واضح، عملي، وموجّه للأداء الحقيقي لا للضجيج.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#C8C2B7] md:text-lg">
              المعضّل يبني تجربة قراءة عربية داكنة ومركّزة حول اللياقة، التغذية
              الرياضية، خسارة الدهون، بناء العضلات، والمكملات بعين تحريرية
              نظيفة وسريعة.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/articles"
                className="inline-flex rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#080808] shadow-[0_14px_40px_rgba(212,175,55,0.18)] hover:translate-y-[-1px] hover:bg-[#E5C25B]"
              >
                ابدأ من الأرشيف
              </Link>
              <Link
                href="/about"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[#F5F1E8] hover:border-[#D4AF37]/30 hover:text-[#F3D98C]"
              >
                اعرف فلسفة المنصة
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8E8677]">
                  المقالات
                </div>
                <div className="display-heading mt-3 text-3xl font-black text-white">
                  {totalPosts}
                </div>
              </div>
              <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8E8677]">
                  التصنيفات
                </div>
                <div className="display-heading mt-3 text-3xl font-black text-white">
                  {totalCategories}
                </div>
              </div>
              <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8E8677]">
                  التجربة
                </div>
                <div className="display-heading mt-3 text-lg font-black leading-8 text-white">
                  RTL نظيف
                  <br />
                  وهوية فاخرة
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {categorySummaries.map((category) => (
                <Link
                  key={category.slug}
                  href={`/articles?category=${category.slug}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#D7D1C6] hover:border-[#D4AF37]/30 hover:text-[#F3D98C]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {featuredPost ? <ArticleCard post={featuredPost} variant="featured" /> : null}
        </div>

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

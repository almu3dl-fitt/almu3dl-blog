import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { buildArticleHref, getPostBySlug } from "@/lib/posts";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "المقال غير موجود",
      description: "لم نتمكن من العثور على المقال المطلوب داخل أرشيف المعضّل.",
    };
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: {
      canonical: buildArticleHref(post.slug),
    },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      url: buildArticleHref(post.slug),
      images: [post.coverImageUrl],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#A8A191]">
          <Link href="/" className="hover:text-[#F3D98C]">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-[#F3D98C]">
            المقالات
          </Link>
          <span>/</span>
          <span className="text-[#F5F1E8]">{post.title}</span>
        </div>

        <article className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="panel-surface overflow-hidden rounded-[34px]">
              <div className="relative h-[340px] overflow-hidden md:h-[440px]">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 65vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,10,0.1),rgba(7,8,10,0.92))]" />
                <div className="absolute inset-x-0 bottom-0 space-y-5 p-7 md:p-9">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-[#D4AF37] px-4 py-2 font-bold text-[#080808]">
                      {post.category.name}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[#F5F1E8]">
                      {post.publishedLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[#F5F1E8]">
                      {post.readingTime}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="display-heading max-w-5xl text-4xl font-black leading-[1.3] text-white md:text-5xl xl:text-6xl">
                      {post.title}
                    </h1>
                    <p className="max-w-3xl text-base leading-8 text-[#DDD6CA] md:text-lg">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel-surface rounded-[34px] p-6 md:p-8 xl:p-10">
              <div className="rounded-[28px] border border-[#D4AF37]/18 bg-[linear-gradient(180deg,rgba(212,175,55,0.08),rgba(212,175,55,0.02))] p-5 md:p-6">
                <div className="section-kicker mb-3">Article Snapshot</div>
                <p className="text-lg leading-9 text-[#EEE7DA]">{post.excerpt}</p>
              </div>

              <div className="mt-8 space-y-5">
                {post.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.anchor}
                    className="scroll-mt-28 rounded-[28px] border border-white/8 bg-black/15 p-5 md:p-6"
                  >
                    <h2 className="display-heading text-2xl font-black leading-[1.5] text-white">
                      {section.heading}
                    </h2>
                    <p className="mt-4 whitespace-pre-line text-base leading-9 text-[#DDD6CA]">
                      {section.content}
                    </p>
                  </section>
                ))}
              </div>
            </section>

            {post.relatedPosts.length > 0 ? (
              <section className="space-y-5">
                <div>
                  <div className="section-kicker mb-2">Related Reading</div>
                  <h2 className="display-heading text-3xl font-black text-white">
                    مقالات ذات صلة
                  </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {post.relatedPosts.map((relatedPost) => (
                    <ArticleCard
                      key={relatedPost.id}
                      post={relatedPost}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="panel-surface rounded-[30px] p-5">
              <div className="section-kicker mb-3">Inside This Article</div>
              <div className="space-y-2">
                {post.sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.anchor}`}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#D7D1C6] hover:border-[#D4AF37]/30 hover:text-[#F3D98C]"
                  >
                    <span className="text-[#F3D98C]">{index + 1}</span>
                    <span>{section.heading}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="panel-surface rounded-[30px] p-5">
              <div className="section-kicker mb-3">Quick Facts</div>
              <div className="space-y-3 text-sm text-[#D7D1C6]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#8E8677]">
                    التصنيف
                  </div>
                  <div className="mt-2 font-semibold text-white">
                    {post.category.name}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#8E8677]">
                    النشر
                  </div>
                  <div className="mt-2 font-semibold text-white">
                    {post.publishedLabel}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#8E8677]">
                    مدة القراءة
                  </div>
                  <div className="mt-2 font-semibold text-white">
                    {post.readingTime}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </article>
      </div>
    </main>
  );
}

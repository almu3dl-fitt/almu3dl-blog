import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buildArticleHref, getPostBySlug } from "@/lib/posts";
import { getStoreHighlight, STORE_URL } from "@/lib/site";

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

  const storeHighlight = getStoreHighlight(post.category.name);

  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <div className="theme-breadcrumb flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="hover:text-[#F3D98C]">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-[#F3D98C]">
            المقالات
          </Link>
          <span>/</span>
          <span className="theme-text-main">{post.title}</span>
        </div>

        <article className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="panel-surface overflow-hidden rounded-[34px]">
              <div className="relative h-[300px] overflow-hidden bg-[var(--panel-plain-soft)] md:h-[400px] xl:h-[460px]">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 65vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,10,0.04),rgba(7,8,10,0.32))]" />
              </div>
            </section>

            <section className="panel-surface rounded-[34px] p-6 md:p-8 xl:p-10">
              <div className="theme-inset-card-strong rounded-[28px] p-5 md:p-6">
                <div className="theme-text-muted mb-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[#D4AF37] px-3 py-1 font-bold text-[#080808]">
                    {post.category.name}
                  </span>
                  <span className="theme-pill rounded-full px-3 py-1">
                    {post.publishedLabel}
                  </span>
                  <span className="theme-pill rounded-full px-3 py-1">
                    {post.readingTime}
                  </span>
                </div>
                <h1 className="display-heading theme-text-main max-w-5xl text-3xl font-black leading-[1.35] md:text-4xl xl:text-5xl">
                  {post.title}
                </h1>
                <div className="mt-5 mb-2 text-sm text-[var(--gold-soft)]">ملخص المقال</div>
                <p className="theme-text-soft text-base leading-8 md:text-lg">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-8 space-y-5">
                {post.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.anchor}
                    className="theme-inset-card scroll-mt-28 rounded-[26px] p-5 md:p-6"
                  >
                    <h2 className="display-heading theme-text-main text-2xl font-black leading-[1.5]">
                      {section.heading}
                    </h2>
                    {/<[a-z][\s\S]*>/i.test(section.content) ? (
                      <div
                        className="article-rich-content mt-4"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    ) : (
                      <p className="theme-text-soft mt-4 whitespace-pre-line text-lg leading-9">
                        {section.content}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="panel-surface rounded-[28px] p-5">
              <div className="theme-text-main mb-4 text-lg font-black">داخل المقال</div>
              <div className="space-y-2">
                {post.sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.anchor}`}
                    className="theme-pill block rounded-2xl px-4 py-3 text-sm"
                  >
                    {index + 1}. {section.heading}
                  </a>
                ))}
              </div>
            </section>

            <section className="theme-store-card rounded-[28px] p-6">
              <div className="theme-store-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em]">
                {storeHighlight.eyebrow}
              </div>
              <div className="theme-text-main mb-3 text-2xl font-black">
                {storeHighlight.title}
              </div>
              <p className="theme-store-copy mb-5 leading-8">
                {storeHighlight.description}
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href={STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#3DDC84] px-5 py-3 font-bold text-black"
                >
                  {storeHighlight.ctaLabel}
                </a>
                <Link
                  href="/articles"
                  className="theme-button-secondary inline-flex w-full items-center justify-center rounded-full px-5 py-3 font-semibold"
                >
                  الانتقال إلى الأرشيف
                </Link>
              </div>
            </section>

            {post.relatedPosts.length > 0 ? (
              <section className="panel-surface rounded-[28px] p-5">
                <div className="theme-text-main mb-4 text-lg font-black">
                  مقالات ذات صلة
                </div>
                <div className="space-y-3">
                  {post.relatedPosts.map((relatedPost, index) => (
                    <Link
                      key={relatedPost.id}
                      href={relatedPost.href}
                      className="theme-pill block rounded-2xl p-4 text-right transition hover:border-[#D4AF37]/30"
                    >
                      <div className="mb-2 text-xs text-[var(--gold-soft)]">
                        مقال مرتبط {index + 1}
                      </div>
                      <div className="theme-text-main font-bold leading-7">
                        {relatedPost.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="panel-surface rounded-[28px] p-5">
              <div className="theme-text-main mb-3 text-lg font-black">بيانات المقال</div>
              <div className="theme-text-soft space-y-3 text-sm">
                <div className="theme-pill rounded-2xl p-4">
                  <div className="theme-text-muted text-xs">التصنيف</div>
                  <div className="theme-text-main mt-2 font-semibold">
                    {post.category.name}
                  </div>
                </div>
                <div className="theme-pill rounded-2xl p-4">
                  <div className="theme-text-muted text-xs">النشر</div>
                  <div className="theme-text-main mt-2 font-semibold">
                    {post.publishedLabel}
                  </div>
                </div>
                <div className="theme-pill rounded-2xl p-4">
                  <div className="theme-text-muted text-xs">مدة القراءة</div>
                  <div className="theme-text-main mt-2 font-semibold">
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

import Image from "next/image";
import Link from "next/link";

import type { ArticleListItem } from "@/lib/posts";

type ArticleCardProps = {
  post: ArticleListItem;
  variant?: "default" | "featured" | "compact";
};

function joinClasses(...values: Array<string | false>) {
  return values.filter(Boolean).join(" ");
}

export function ArticleCard({
  post,
  variant = "default",
}: ArticleCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <article
      className={joinClasses(
        "panel-surface group overflow-hidden rounded-[30px] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/25",
        isFeatured && "h-full",
        isCompact && "rounded-[24px]",
      )}
    >
      <Link href={post.href} className="block h-full">
        <div
          className={joinClasses(
            "relative overflow-hidden",
            isFeatured ? "h-[360px] md:h-[440px]" : isCompact ? "h-44" : "h-60",
          )}
        >
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes={
              isFeatured
                ? "(max-width: 1280px) 100vw, 42vw"
                : isCompact
                  ? "(max-width: 768px) 100vw, 24vw"
                  : "(max-width: 1280px) 100vw, 33vw"
            }
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            priority={isFeatured}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,7,0.1),rgba(5,6,7,0.82))]" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-5">
            <span className="theme-inset-card rounded-full px-3 py-1 text-xs theme-text-main">
              {post.category.name}
            </span>
            <span className="theme-pill-active rounded-full px-3 py-1 text-xs font-semibold">
              {post.readingTime}
            </span>
          </div>
        </div>

        <div className={joinClasses("space-y-4 p-5", isFeatured && "p-7 md:p-8")}>
          <div className="theme-text-muted flex flex-wrap items-center gap-3 text-xs">
            <span>{post.publishedLabel}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
            <span>مقال تحريري</span>
          </div>

          <h2
            className={joinClasses(
              "display-heading font-black leading-[1.45] theme-text-main transition group-hover:text-[var(--gold-soft)]",
              isFeatured
                ? "text-[1.55rem] md:text-[1.95rem]"
                : isCompact
                  ? "text-lg"
                  : "text-[1.02rem] md:text-[1.12rem]",
            )}
          >
            {post.title}
          </h2>

          {!isCompact ? (
            <p className="theme-text-soft line-clamp-3 text-sm leading-7">
              {post.excerpt}
            </p>
          ) : null}

          <span className="theme-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            اقرأ المقال
            <span className="text-[var(--gold)]">←</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

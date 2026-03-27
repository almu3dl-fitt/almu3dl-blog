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
        "group overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(20,23,28,0.96),rgba(11,12,15,0.96))] shadow-[0_26px_80px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/25",
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
            <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-[#F8F1E2]">
              {post.category.name}
            </span>
            <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/12 px-3 py-1 text-xs font-semibold text-[#F3D98C]">
              {post.readingTime}
            </span>
          </div>
        </div>

        <div className={joinClasses("space-y-4 p-5", isFeatured && "p-7 md:p-8")}>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#A8A191]">
            <span>{post.publishedLabel}</span>
            <span className="h-1 w-1 rounded-full bg-[#5D5649]" />
            <span>مقال تحريري</span>
          </div>

          <h2
            className={joinClasses(
              "display-heading font-black leading-[1.45] text-white transition group-hover:text-[#F3D98C]",
              isFeatured ? "text-3xl md:text-4xl" : isCompact ? "text-lg" : "text-xl",
            )}
          >
            {post.title}
          </h2>

          {!isCompact ? (
            <p className="line-clamp-3 text-sm leading-7 text-[#C7C0B3] md:text-base">
              {post.excerpt}
            </p>
          ) : null}

          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#F5F1E8] transition group-hover:border-[#D4AF37]/30 group-hover:text-[#F3D98C]">
            اقرأ المقال
            <span className="text-[#D4AF37]">←</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
